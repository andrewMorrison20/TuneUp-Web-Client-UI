// profile.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService } from './profile.service';
import { environment } from '../../environments/environment';
import { Price } from './interfaces/price';

const baseUrl = environment.apiUrl;

const mockPrices: Price[] = [{
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

  it('should handle error on fetch all profiles', () => {
    spyOn(console, 'error');
    service.getAllProfiles().subscribe({
      error: (err) => {
        expect(console.error).toHaveBeenCalled();
        expect(err.status).toBe(500);
      }
    });
    const req = httpMock.expectOne(`${baseUrl}/profiles?page=0&size=8&sort=displayName,asc`);
    req.flush({}, { status: 500, statusText: 'Server Error' });
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

  it('should handle error on getProfileReviews', () => {
    spyOn(console, 'error');
    service.getProfileReviews(101).subscribe({
      error: err => {
        expect(console.error).toHaveBeenCalledWith(jasmine.stringMatching(/Error fetching reviews/), jasmine.anything());
      }
    });
    const req = httpMock.expectOne(`${baseUrl}/review/101`);
    req.flush({}, { status: 404, statusText: 'Not Found' });
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

  it('should handle error on getProfileById', () => {
    spyOn(console, 'error');
    service.getProfileById(42).subscribe({
      error: err => {
        expect(console.error).toHaveBeenCalledWith(jasmine.stringMatching(/Error fetching profile/), jasmine.anything());
      }
    });
    const req = httpMock.expectOne(`${baseUrl}/profiles/42`);
    req.flush({}, { status: 404, statusText: 'Not Found' });
  });

  it('should get profile by app user ID', () => {
    const profile = { id: 7, profileType: 'Student', prices: [], instruments: [], displayName: 'Alex' };
    service.getProfileByAppUserId(7).subscribe(res => {
      expect(res.id).toBe(7);
      expect(res.displayName).toBe('Alex');
    });
    const req = httpMock.expectOne(`${baseUrl}/profiles/profile/7`);
    expect(req.request.method).toBe('GET');
    req.flush(profile);
  });

  it('should update profile pricing', () => {
    const profile = { id: 1, profileType: 'Tutor' } as any;
    service.updateProfilePricing(mockPrices, profile).subscribe(res => {
      expect(res).toBeTruthy();
    });
    const req = httpMock.expectOne(`${baseUrl}/profiles/update/pricing/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true });
  });

  it('should update profile', () => {
    const profile = { id: 2, profileType: 'Student', prices: [], instruments: [], displayName: 'Jane' } as any;
    service.updateProfile(profile).subscribe(res => {
      expect(res).toBeTruthy();
    });
    const req = httpMock.expectOne(`${baseUrl}/profiles/update`);
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

  it('should handle error on createReview', () => {
    spyOn(console, 'error');
    const dto = { reviewerProfileId: 1, reviewerName: 'Jim', profileId: 4, rating: 3, tuitionId: 88, comment: 'meh', title: 'ok' };
    service.createReview(dto).subscribe({
      error: err => {
        expect(console.error).toHaveBeenCalledWith('Error creating review:', jasmine.anything());
      }
    });
    const req = httpMock.expectOne(`${baseUrl}/review`);
    req.flush({}, { status: 400, statusText: 'Bad Request' });
  });

  it('should get profile qualifications by ID', () => {
    const mockResponse = [{ qualificationId: 1, instrumentId: 2 }];
    service.getProfileQualificationsById(99).subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].qualificationId).toBe(1);
    });
    const req = httpMock.expectOne(`${baseUrl}/profiles/instrumentQualifications/99`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should map backend to frontend price format correctly', () => {
    const backendPrice: Price = { period: 'HOURLY', rate: 20, description: 'desc', standardPricing: true };
    const result = (service as any).mapPriceFormatBackendToFrontend(backendPrice);
    expect(result.period).toBeDefined();
  });

  it('should map frontend to backend price format correctly', () => {
    const frontendPrice: Price = {  period: 'hourly', rate: 20, description: 'desc', standardPricing: true };
    const result = (service as any).mapPriceFormatFrontendToBackend(frontendPrice);
    expect(result.period).toBeDefined();
  });

  it('should throw error for unknown profile type in mapProfiles', () => {
    const rawProfiles = [{ profileType: 'Alien' }];

    expect(() => {
      (service as any).mapProfiles(rawProfiles);
    }).toThrowError('Unknown profile type');
  });

  it('should throw error for null rawReviews in mapReviews', () => {
    expect(() => {
      (service as any).mapReviews(null);
    }).toThrowError('Empty Review');
  });

});
