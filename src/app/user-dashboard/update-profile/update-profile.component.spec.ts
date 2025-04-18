import { TestBed } from '@angular/core/testing';
import { UpdateProfileComponent } from './update-profile.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ProfileService } from '../../profiles/profile.service';
import { SharedDataService } from '../../components/shared-data-service.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserDashboardModule } from '../user-dashboard.module';
import {RouterTestingModule} from "@angular/router/testing";
import {PeriodMap} from "../../profiles/interfaces/period";

describe('UpdateProfileComponent logic', () => {
  let comp: UpdateProfileComponent;
  let http: HttpTestingController;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let sharedDataServiceSpy: jasmine.SpyObj<SharedDataService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    profileServiceSpy = jasmine.createSpyObj('ProfileService', [
      'updateProfile',
      'updateProfilePricing',
      'updateProfileQualifications',
      'getProfileByAppUserId'
    ]);
    profileServiceSpy.updateProfile.and.returnValue(of({}));
    profileServiceSpy.updateProfilePricing.and.returnValue(of({}));
    profileServiceSpy.updateProfileQualifications.and.returnValue(of({}));
    profileServiceSpy.getProfileByAppUserId.and.returnValue(of({ id: 1, reviews: [] } as any));

    sharedDataServiceSpy = jasmine.createSpyObj(
      'SharedDataService',
      ['loadInstruments', 'loadGenres', 'loadQualifications'],
      {
        instruments$: of([]),
        genres$: of([]),
        qualifications$: of([])
      }
    );
    // the loadX methods can remain as spies without return values

    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        RouterTestingModule,
        UserDashboardModule
      ],
      providers: [
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: SharedDataService, useValue: sharedDataServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(UpdateProfileComponent);
    comp = fixture.componentInstance;
    // supply minimal required profile input
    comp.profile = { id: 1 } as any;
    http = TestBed.inject(HttpTestingController);
  });

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

  it('addPricing adds non‑duplicate only', () => {
    comp.newPricing = { period: '30 min', rate: 10, standardPricing: true, description: '' };
    comp.addPricing();
    expect(comp.pricingList.length).toBe(1);
    comp.addPricing(); // duplicate
    expect(comp.pricingList.length).toBe(1);
  });

  it('onRegionSearch requests backend only when query length > 2', () => {
    comp.searchQuery = 'ab';
    comp.onRegionSearch();
    http.expectNone('http://localhost:8080/api/regions?query=ab');

    comp.searchQuery = 'abc';
    comp.onRegionSearch();
    const req = http.expectOne('http://localhost:8080/api/regions?query=abc');
    req.flush([{ id: 1, name: 'Region 1' }]);
    expect(comp.regionSuggestions.length).toBe(1);
  });

  it('onSubmitProfile success path shows success snackbar', () => {
    comp.onSubmitProfile();
    expect(profileServiceSpy.updateProfile).toHaveBeenCalledWith(comp.profile);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Profile updated successfully!',
      'Close',
      { duration: 3000 }
    );
  });

  it('loadPricing maps backend enum via PeriodMap (with fallback)', () => {
    comp.loadPricing();

    const req = http.expectOne('http://localhost:8080/api/prices/standardPricing');
    req.flush([{ period: 'THIRTY_MIN', rate: 15 }]);

    const raw = 'THIRTY_MIN';
    const human = PeriodMap[raw as keyof typeof PeriodMap] ?? raw;

    expect(comp.standardPrices[0].period).toBe(human);
    expect(comp.durations).toEqual([human]);
    expect(comp.rates).toEqual([15]);
  });
});
