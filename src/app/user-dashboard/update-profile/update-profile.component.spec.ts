import {  TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { UpdateProfileComponent } from './update-profile.component';
import { ProfileService } from '../../profiles/profile.service';
import { SharedDataService } from '../../components/shared-data-service.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { UserDashboardModule } from '../user-dashboard.module';


describe('UpdateProfileComponent logic', () => {
  let comp: UpdateProfileComponent;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let profileService: jasmine.SpyObj<ProfileService>;
  let sharedData: jasmine.SpyObj<SharedDataService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    profileService = jasmine.createSpyObj('ProfileService', [
      'updateProfile',
      'updateProfilePricing',
      'updateProfileQualifications',
      'getProfileByAppUserId'
    ]);
    profileService.updateProfile.and.returnValue(of({}));
    profileService.updateProfilePricing.and.returnValue(of({}));
    profileService.updateProfileQualifications.and.returnValue(of({}));
    profileService.getProfileByAppUserId.and.returnValue(
      of({ id: 1, reviews: [], profilePicture: '' } as any)
    );

    sharedData = jasmine.createSpyObj(
      'SharedDataService',
      ['loadInstruments', 'loadGenres', 'loadQualifications'],
      {
        instruments$: of([]),
        genres$: of([]),
        qualifications$: of([])
      }
    );

    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        RouterTestingModule,
        UserDashboardModule
      ],
      providers: [
        { provide: ProfileService, useValue: profileService },
        { provide: SharedDataService, useValue: sharedData },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(UpdateProfileComponent);
    comp = fixture.componentInstance;
    // initialize required profile
    comp.profile = { id: 1, reviews: [], profilePicture: '' } as any;
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => httpMock.verify());

  it('validates description length', () => {
    expect((comp as any).isValidDescription('')).toBeFalse();
    expect((comp as any).isValidDescription('a'.repeat(51))).toBeFalse();
    expect((comp as any).isValidDescription('valid')).toBeTrue();
  });

  it('validates rate format', () => {
    expect((comp as any).isValidRate(10)).toBeTrue();
    expect((comp as any).isValidRate(10.99)).toBeTrue();
    expect((comp as any).isValidRate(10.999)).toBeFalse();
  });

  describe('basic pricing', () => {
    it('addPricing adds only non-duplicates', () => {
      comp.newPricing = { period: '30 min', rate: 10, standardPricing: true, description: '' };
      comp.addPricing();
      expect(comp.pricingList.length).toBe(1);
      comp.addPricing();
      expect(comp.pricingList.length).toBe(1);
    });

    it('removePricing removes at index', () => {
      comp.pricingList = [{ period: 'p', rate: 1, standardPricing: true, description: '' }];
      comp.removePricing(0);
      expect(comp.pricingList.length).toBe(0);
    });
  });

  describe('addCustomPricing()', () => {
    beforeEach(() => comp.pricingList = []);
    it('adds valid custom and resets', () => {
      comp.customPricing = { period:'CUSTOM', rate:5, standardPricing:false, description:'ok' };
      comp.addCustomPricing();
      expect(comp.pricingList.length).toBe(1);
      expect(comp.customPricing).toEqual({ period:'CUSTOM', rate:0, standardPricing:false, description:'' });
    });
    it('alerts on duplicate', () => {
      spyOn(window, 'alert');
      comp.customPricing = { period:'CUSTOM', rate:5, standardPricing:false, description:'ok' };
      comp.pricingList = [ {...comp.customPricing} ];
      comp.addCustomPricing();
      expect(window.alert).toHaveBeenCalledWith('This description and rate combination already exists.');
    });
    it('alerts on bad description', () => {
      spyOn(window, 'alert');
      comp.customPricing = { period:'CUSTOM', rate:5, standardPricing:false, description:'' };
      comp.addCustomPricing();
      expect(window.alert).toHaveBeenCalledWith('Description must be provided and be 50 characters or fewer.');
    });
    it('alerts on bad rate', () => {
      spyOn(window, 'alert');
      comp.customPricing = { period:'CUSTOM', rate:5.999, standardPricing:false, description:'ok' };
      comp.addCustomPricing();
      expect(window.alert).toHaveBeenCalledWith('Please enter a valid price with up to two decimal places (e.g., 10.99).');
    });
  });

  describe('onRegionSearch()', () => {
    it('no backend when len ≤2', () => {
      comp.searchQuery = 'ab';
      comp.onRegionSearch();
      httpMock.expectNone('http://localhost:8080/api/regions?query=ab');
      expect(comp.regionSuggestions).toEqual([]);
    });
    it('calls backend when len >2', () => {
      comp.searchQuery = 'abc';
      comp.onRegionSearch();
      const req = httpMock.expectOne('http://localhost:8080/api/regions?query=abc');
      req.flush([{ id:1, name:'R' }]);
      expect(comp.regionSuggestions).toEqual([{ id:1, name:'R' }]);
    });
    it('selectRegion sets and clears', () => {
      const region = { id:5, name:'X' };
      comp.regionSuggestions = [region];
      comp.selectRegion(region);
      expect(comp.selectedRegion).toBe(region);
      expect(comp.profile.tuitionRegion).toBe(region);
      expect(comp.regionSuggestions).toEqual([]);
    });
  });

  describe('file upload', () => {
    let file: File;
    beforeEach(() => {
      file = new File([''], 'pic.png', { type:'image/png' });
      class ReaderMock { onload!:any; readAsDataURL(_f:File){ this.onload({ target:{ result:'data:' }}); } }
      spyOn(window as any, 'FileReader').and.returnValue(new ReaderMock());
    });
    it('uploads + previews', fakeAsync(() => {
      spyOn(httpClient, 'post').and.returnValue(of('url'));
      comp.onFileSelected({ target:{ files:[file] } });
      tick();
      expect((comp.profile as any).profilePicture).toBe('url');
      expect(snackBar.open).toHaveBeenCalledWith('Profile photo uploaded successfully.', 'Close', { duration:3000 });
    }));
    it('logs error on upload failure', fakeAsync(() => {
      spyOn(httpClient, 'post').and.returnValue(throwError(() => new Error()));
      spyOn(console, 'error');
      comp.onFileSelected({ target:{ files:[file] } });
      tick();
      expect(console.error).toHaveBeenCalled();
    }));
  });

  describe('ngOnInit()', () => {
    it('should call loadProfile, loadPricing, subscribe to streams and invoke loader methods', () => {
      spyOn<any>(comp, 'loadProfile');
      spyOn<any>(comp, 'loadPricing');

      const sharedData = TestBed.inject(SharedDataService) as jasmine.SpyObj<SharedDataService>;

      sharedData.instruments$    = of([{ id: 1, name: 'Guitar' }] as any);
      sharedData.genres$         = of([{ id: 2, name: 'Jazz'   }] as any);
      sharedData.qualifications$ = of([{ id: 3, name: 'Grade 5'}] as any);

      comp.ngOnInit();

      expect((comp as any).loadProfile).toHaveBeenCalled();
      expect((comp as any).loadPricing).toHaveBeenCalled();

      expect(sharedData.loadInstruments).toHaveBeenCalled();
      expect(sharedData.loadGenres).toHaveBeenCalled();
      expect(sharedData.loadQualifications).toHaveBeenCalled();
    });
  });

  describe('loadProfile()', () => {
    it('sets profile on success', fakeAsync(() => {
      profileService.getProfileByAppUserId.and.returnValue(of({ id:9, reviews:[], profilePicture:'' } as any));
      (comp as any).loadProfile();
      tick();
      expect(comp.profile.id).toBe(9);
    }));
    it('handles error', fakeAsync(() => {
      const err = new Error();
      profileService.getProfileByAppUserId.and.returnValue(throwError(() => err));
      spyOn(console, 'error');
      (comp as any).loadProfile();
      tick();
      expect(snackBar.open).toHaveBeenCalledWith('Failed to fetch profile. Please refresh the page.', 'Close', { duration:3000 });
      expect(console.error).toHaveBeenCalledWith('Error fetching profile:', err);
    }));
  });

  describe('loadPricing()', () => {
    it('handles error', fakeAsync(() => {
      spyOn(console, 'error');

      comp.loadPricing();
      const req = httpMock.expectOne('http://localhost:8080/api/prices/standardPricing');
      req.flush('e', { status: 500, statusText: 'Err' });

      tick();

      expect(snackBar.open)
        .toHaveBeenCalledWith(
          'Failed to Pricing. Please refresh the page.',
          'Close',
          { duration: 3000 }
        );

      expect(console.error)
        .toHaveBeenCalledWith(
          'Error fetching standard pricing:',
          jasmine.anything()
        );
    }));
  });


  describe('onSubmitProfile()', () => {
    it('success shows snackbar', () => {
      comp.onSubmitProfile();
      expect(profileService.updateProfile).toHaveBeenCalledWith(comp.profile);
      expect(snackBar.open).toHaveBeenCalledWith('Profile updated successfully!', 'Close', { duration:3000 });
    });
    it('error shows fallback', () => {
      profileService.updateProfile.and.returnValue(throwError(() => new Error()));
      spyOn(console, 'error');
      comp.onSubmitProfile();
      expect(snackBar.open).toHaveBeenCalledWith('Failed to update profile. Please try again.', 'Close', { duration:3000 });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('onSubmitPricing()', () => {
    it('success shows snackbar', () => {
      comp.pricingList = [];
      comp.onSubmitPricing();
      expect(profileService.updateProfilePricing).toHaveBeenCalledWith(comp.pricingList, comp.profile);
      expect(snackBar.open).toHaveBeenCalledWith('Pricing updated successfully!', 'Close', { duration:3000 });
    });
    it('error shows fallback', () => {
      profileService.updateProfilePricing.and.returnValue(throwError(() => new Error()));
      spyOn(console, 'error');
      comp.onSubmitPricing();
      expect(snackBar.open).toHaveBeenCalledWith('Failed to update pricing. Please try again.', 'Close', { duration:3000 });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('qualifications', () => {
    it('adds new combo only once', () => {
      comp.newQualification = { qualification:{id:1,name:''} as any, instrument:{id:2,name:''} as any };
      comp.addQualification();
      expect(comp.selectedQualifications.length).toBe(1);
      comp.addQualification();
      expect(comp.selectedQualifications.length).toBe(1);
    });
    it('alerts if missing', () => {
      spyOn(window,'alert');
      comp.newQualification = { qualification:null, instrument:null };
      comp.addQualification();
      expect(window.alert).toHaveBeenCalledWith('Both qualification and instrument are required.');
    });
    it('removes by index', () => {
      comp.selectedQualifications = [{ qualification:{id:1,name:''} as any, instrument:{id:2,name:''} as any }];
      comp.removeQualification(0);
      expect(comp.selectedQualifications.length).toBe(0);
    });
  });

  describe('onSubmitQualifications()', () => {
    it('success shows snackbar', () => {
      comp.selectedQualifications = [{ qualification:{id:1,name:''} as any, instrument:{id:2,name:''} as any }];
      comp.onSubmitQualifications();
      expect(profileService.updateProfileQualifications).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('Qualifications updated successfully!', 'Close', { duration:3000 });
    });
    it('error shows fallback', () => {
      profileService.updateProfileQualifications.and.returnValue(throwError(() => new Error()));
      spyOn(console,'error');
      comp.onSubmitQualifications();
      expect(snackBar.open).toHaveBeenCalledWith('Failed to update Qualifications. Please try again.', 'Close', { duration:3000 });
      expect(console.error).toHaveBeenCalled();
    });
  });
});
