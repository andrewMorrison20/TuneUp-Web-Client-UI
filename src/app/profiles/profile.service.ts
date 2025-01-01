import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TutorProfile } from './interfaces/tutor.model';
import { StudentProfile } from './interfaces/student.model';
import {Review} from "./interfaces/review.model";
import {Price} from "./interfaces/price";
import {PeriodMap} from "./interfaces/period";

type Profile = TutorProfile | StudentProfile;

interface ProfileResponse {
  content: any[];  // The raw array of profiles returned by the API
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8080/api/profiles';
  public apiReviewUrl = 'http://localhost:8080/api/review';



  constructor(private http: HttpClient) {}

  getAllProfiles(page: number = 0, size: number = 8, sort: string = 'displayName,asc'): Observable<{ profiles: Profile[]; totalElements: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ProfileResponse>(this.apiUrl, { params }).pipe(
      map(response => ({
        profiles: this.mapProfiles(response.content),
        totalElements: response.totalElements,
      }))
    );
  }

  /**
   * Get filtered profiles based on search criteria with pagination and sorting.
   */
  getFilteredProfiles(searchParams: any, page: number = 0, size: number = 8, sort: string = 'displayName,asc'): Observable<{ profiles: any[]; totalElements: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.post<ProfileResponse>(`${this.apiUrl}/search`, searchParams, { params }).pipe(
      map(response => ({
        profiles: this.mapProfiles(response.content),
        totalElements: response.totalElements,
      }))
    );
  }

  public getProfileReviews(profile: any): void {
    const url = `${this.apiReviewUrl}/${profile.id}`;
    this.http.get<ProfileResponse[]>(url).pipe(
      map(response => this.mapReviews(response)) // Map the reviews to the desired format
    ).subscribe(
      (reviews) => {
        profile.reviews = reviews; // Assign the resolved reviews
        console.log('Resolved reviews:', reviews);
      },
      (error) => {
        console.error('Error fetching reviews:', error);
      }
    );
  }

  getProfileById(id: string) {
    const url = `${this.apiUrl}/${id}`;
    const params = new HttpParams().set('id', id);

    return this.http.get<Profile>(url).pipe(
      map(response => this.mapProfiles([response]))
    ).pipe(
      map(profiles => profiles[0])
    );
  }

  public getProfileByAppUserId(userId: number) {
    const url = `${this.apiUrl}/profile/${userId}`;

    return this.http.get<Profile>(url).pipe(
      map(response => this.mapProfiles([response]))
    ).pipe(
      map(profiles => profiles[0])
    );
  }

  public updateProfile(profile: Profile): Observable<any> {
    const url = `${this.apiUrl}/update`;
    return this.http.put(url, profile);
  }


  public updateProfilePricing(priceSet: Price[], profile: Profile): Observable<any> {
    // Map human-readable strings to backend enum format
    const transformedPriceSet = priceSet.map(price => ({
      ...price,
      period: Object.keys(PeriodMap).find(key => PeriodMap[key as keyof typeof PeriodMap] === price.period) || price.period // Convert string to enum
    }));

    console.log('Transformed Prices for Backend:', transformedPriceSet);

    const url = `${this.apiUrl}/update/pricing/${profile.id}`;
    // Return the HTTP PUT observable
    return this.http.put(url, transformedPriceSet);
  }

  private mapProfiles(rawProfiles: any[]): Profile[] {
    console.log('Profile : ', rawProfiles)
    return rawProfiles.map(profile => {
      if (profile.profileType === 'Tutor') {
        return this.mapToTutorProfile(profile);
      } else if (profile.profileType === 'Student') {
        return this.mapToStudentProfile(profile);
      } else {
        throw new Error('Unknown profile type');
      }
    });
  }

  private mapReviews(rawReviews: any[]): Review[] {
    console.log('Reviews', rawReviews)
    return rawReviews.map(review => {
      if(rawReviews != null) {
        return this.mapToReview(review);
      } else {
      throw new Error('Empty Review')}});
  }


  private mapToTutorProfile(profile: any): TutorProfile {
    return {
      enrolledStudents: 0,
      profilePicture: profile.profilePicture,
      qualifications: "",
      rating: 0,
      reviews:[],
      id: profile.id,
      displayName: profile.displayName,
      bio: profile.bio,
      onlineLessons: profile.onlineLessons,
      profileType: profile.profileType,
      instruments: profile.instruments,
      appUserId: profile.appUserId,
      prices: profile.prices.map(this.mapPriceFormatBackendToFrontend.bind(this)),
      genres:profile.genres,
      tuitionRegion: profile.tuitionRegion
    };
  }

  private mapToStudentProfile(profile: any): StudentProfile {
    return {
      achievements: [],
      completedCourses: [],
      grades: [],
      instruments: profile.instruments,
      profilePicture: profile.profilePicture,
      reviews: [],
      id: profile.id,
      displayName: profile.displayName,
      bio: profile.bio,
      onlineLessons: profile.onlineLessons,
      profileType: profile.profileType,
      appUserId: profile.appUserId,
      enrolledCourses: [],
      genres:profile.genres,
      tuitionRegion: profile.tuitionRegion
    };
  }

  private mapToReview(review: any): Review {
    return {
      comment: review.comment,
      rating: review.rating,
      reviewer: review.reviewerName
    }
  }

  private mapPriceFormatBackendToFrontend(price: Price): Price {
    return {
      ...price,
      period: PeriodMap[price.period as keyof typeof PeriodMap] || price.period
    };
  }

  private mapPriceFormatFrontendToBackend(price: Price): Price {
    return {
      ...price,
      period: Object.keys(PeriodMap).find(key => PeriodMap[key as keyof typeof PeriodMap] === price.period) || price.period
    };
  }

}
