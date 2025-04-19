import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService } from './profile.service';
import { environment } from '../../environments/environment';

const baseUrl = environment.apiUrl;

const prices = [{
  amount: 10,
  period: 'hourly',
  rate: 10,
  description: 'test',
  standardPricing: true
}];


describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProfileService]
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch all profiles', () => {
    const mockResponse = {
      content: [{ id: 1, profileType: 'Tutor', prices: [], instruments: [], displayName: 'Alice' }],
      totalElements: 1,
      pageable: {},
      totalPages: 1,
      size: 1,
      number: 0,
      first: true,
      last: true
    };

    service.getAllProfiles().subscribe(res => {
      expect(res.totalElements).toBe(1);
      expect(res.profiles.length).toBe(1);
    });

    const req = httpMock.expectOne(`${baseUrl}/profiles?page=0&size=8&sort=displayName,asc`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch filtered profiles', () => {
    const searchParams = { name: 'John' };
    const mockResponse = {
      content: [{ id: 2, profileType: 'Student', prices: [], instruments: [], displayName: 'John' }],
      totalElements: 1,
      pageable: {},
      totalPages: 1,
      size: 1,
      number: 0,
      first: true,
      last: true
    };

    service.getFilteredProfiles(searchParams).subscribe(res => {
      expect(res.totalElements).toBe(1);
      expect(res.profiles[0].displayName).toBe('John');
    });

    const req = httpMock.expectOne(`${baseUrl}/profiles/search?page=0&size=8&sort=displayName,asc`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should get profile reviews', () => {
    const reviews = [{ comment: 'Good', rating: 4, reviewerName: 'Tom', title: 'Nice' }];

    service.getProfileReviews(5).subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].comment).toBe('Good');
    });

    const req = httpMock.expectOne(`${baseUrl}/review/5`);
    expect(req.request.method).toBe('GET');
    req.flush(reviews);
  });

  it('should get profile by ID', () => {
    const profile = { id: 1, profileType: 'Tutor', prices: [], instruments: [], displayName: 'Alice' };

    service.getProfileById(1).subscribe(res => {
      expect(res.id).toBe(1);
      expect(res.displayName).toBe('Alice');
    });

    const req = httpMock.expectOne(`${baseUrl}/profiles/1`);
    expect(req.request.method).toBe('GET');
    req.flush(profile);
  });

  it('should update profile pricing', () => {
    const profile = { id: 1, profileType: 'Tutor' } as any;

    service.updateProfilePricing(prices, profile).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/profiles/update/pricing/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true });
  });

  it('should create a review', () => {
    const reviewDto = {
      reviewerProfileId: 1,
      reviewerName: 'Ann',
      profileId: 2,
      rating: 5,
      tuitionId: 99,
      comment: 'Excellent',
      title: 'Perfect'
    };

    service.createReview(reviewDto).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${baseUrl}/review`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
