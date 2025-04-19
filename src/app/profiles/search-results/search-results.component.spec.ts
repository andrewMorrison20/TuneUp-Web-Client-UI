// search-results.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchResultsComponent } from './search-results.component';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProfileService } from '../profile.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {ProfileModule} from "../profile.module";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('SearchResultsComponent', () => {
  let component: SearchResultsComponent;
  let fixture: ComponentFixture<SearchResultsComponent>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockActivatedRoute;

  beforeEach(async () => {
    mockProfileService = jasmine.createSpyObj('ProfileService', ['getFilteredProfiles']);
    mockActivatedRoute = {
      queryParams: of({
        keyword: 'test',
        rating: 4,
        genres: [1],
        qualifications: [2],
        priceRange: [10, 20],
        regionId: 3,
        instruments: [5],
        profileType: 'Tutor',
        page: 1,
        size: 10,
        startDate: '2023-01-01',
        endDate: '2023-01-02',
        lessonType: ['online']
      })
    };

    await TestBed.configureTestingModule({
      declarations: [SearchResultsComponent],
      providers: [
        { provide: ProfileService, useValue: mockProfileService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with query params and call fetchProfiles', () => {
    const profiles = [{ id: 1, profileType: 'Tutor', displayName: 'Tutor 1' }];
    mockProfileService.getFilteredProfiles.and.returnValue(of({ profiles, totalElements: 1 }));

    component.ngOnInit();

    expect(component.keyword).toBe('test');
    expect(component.rating).toBe(4);
    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(10);
    expect(component.profiles.length).toBe(1);
    expect(component.totalElements).toBe(1);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle fetchProfiles success', () => {
    const mockImage = {
      id: 1,
      url: '',
      alt: '',
      description: '',
      filename: ''
    };

    const mockTuitionRegion = {
      id: 1,
      name: 'Mock Region'
    };

    const tutorProfile = {
      id: 1,
      profileType: 'Tutor',
      displayName: 'Tutor 1',
      bio: '',
      averageRating: 5,
      lessonType: 'online',
      profilePicture: mockImage,
      instruments: [],
      reviews: [],
      prices: [],
      qualifications: [],
      instrumentQuals: [],
      enrolledStudents: 0,
      appUserId: 1,
      genres: [],
      tuitionRegion: mockTuitionRegion
    };

    mockProfileService.getFilteredProfiles.and.returnValue(of({
      profiles: [tutorProfile],
      totalElements: 1
    }));

    component.fetchProfiles();

    expect(component.profiles).toEqual([tutorProfile]);
    expect(component.totalElements).toBe(1);
    expect(component.isLoading).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('should handle fetchProfiles error', () => {
    mockProfileService.getFilteredProfiles.and.returnValue(throwError(() => new Error('Network error')));

    component.fetchProfiles();

    expect(component.error).toBe('An error occurred while loading profiles.');
    expect(component.isLoading).toBeFalse();
    expect(component.profiles).toEqual([]);
  });

  it('should update pagination and fetch on page change', () => {
    const profiles = [{ id: 1, profileType: 'Tutor' }];
    mockProfileService.getFilteredProfiles.and.returnValue(of({ profiles, totalElements: 1 }));

    component.onPageChange({ pageIndex: 2, pageSize: 20 });

    expect(component.pageIndex).toBe(2);
    expect(component.pageSize).toBe(20);
    expect(mockProfileService.getFilteredProfiles).toHaveBeenCalled();
  });

  it('should toggle filtersBannerExpanded', () => {
    component.filtersBannerExpanded = false;
    component.toggleFiltersBanner();
    expect(component.filtersBannerExpanded).toBeTrue();
  });

  it('should toggle searchBannerExpanded', () => {
    component.searchBannerExpanded = false;
    component.toggleSearchBanner();
    expect(component.searchBannerExpanded).toBeTrue();
  });

  it('should detect mobile screen', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(500);
    component.checkScreenSize();
    expect(component.isMobile).toBeTrue();
  });

  it('should detect desktop screen', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(1024);
    component.checkScreenSize();
    expect(component.isMobile).toBeFalse();
  });

  it('should call toggle on sidenav element', () => {
    const toggleSpy = jasmine.createSpy('toggle');
    const fakeSidenav = document.createElement('mat-sidenav') as any;
    fakeSidenav.toggle = toggleSpy;
    spyOn(document, 'querySelector').and.returnValue(fakeSidenav);

    component.toggleSidenav();

    expect(toggleSpy).toHaveBeenCalled();
  });

  it('should fallback to null for missing query params', () => {
    const emptyQueryParams = of({});

    TestBed.resetTestingModule(); // 💡 clear previous setup
    TestBed.configureTestingModule({
      imports: [ProfileModule,NoopAnimationsModule],
      providers: [
        { provide: ProfileService, useValue: mockProfileService },
        { provide: ActivatedRoute, useValue: { queryParams: emptyQueryParams } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SearchResultsComponent);
    const component = fixture.componentInstance;

    mockProfileService.getFilteredProfiles.and.returnValue(of({ profiles: [], totalElements: 0 }));

    fixture.detectChanges();

    expect(component.keyword).toBeNull();
    expect(component.rating).toBeNull();
    expect(component.genres).toBeNull();
  });

});
