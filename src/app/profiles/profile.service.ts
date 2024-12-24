import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TutorProfile } from './interfaces/tutor.model';
import { StudentProfile } from './interfaces/student.model';
import {Review} from "./interfaces/review.model";

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

  public updateProfile( profile: Profile){
    const url = `${this.apiUrl}/update`;
    this.http
      .put(url,profile)
      .subscribe((response) => console.log('Profile updated successfully', response));
  }


  private mapProfiles(rawProfiles: any[]): Profile[] {
    console.log('Profile : ', rawProfiles)
    return rawProfiles.map(profile => {
      if (profile.profileType === 'TUTOR') {
        return this.mapToTutorProfile(profile);
      } else if (profile.profileType === 'STUDENT') {
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
      name: profile.displayName,
      bio: profile.bio,
      onlineLessons: profile.onlineLessons,
      profileType: profile.profileType,
      instruments: profile.instruments,
      appUserId: profile.appUserId,
      pricesMap: profile.prices ? this.mapPricesToMap(profile.prices) : new Map(),
      genres:profile.genres,
      tuitionRegion: profile.tuitionRegion
    };
  }

  private mapPricesToMap(prices: any[]): Map<string, number> {
    return prices.reduce((map: Map<string, number>, price: any) => {
      map.set(this.formatPeriod(price.period), price.rate);
      return map;
    }, new Map());
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
      name: profile.displayName,
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

  private formatPeriod(period: string): string {
    const periodMap: { [key: string]: string } = {
      ONE_HOUR: '1 hour',
      TWO_HOURS: '2 hours',
      HALF_HOUR: '30 minutes',
      CUSTOM: 'Custom duration',
    };
    return periodMap[period] || period; // Fallback to raw period if not mapped
  }
}
