import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import { map } from 'rxjs/operators';

import { TutorProfile } from './interfaces/tutor.model';
import { StudentProfile } from './interfaces/student.model';
import {Review} from "./interfaces/review.model";
import {Price} from "./interfaces/price";
import {PeriodMap} from "./interfaces/period";
import {environment} from "../../environments/environment";
import {InstrumentQualification} from "../components/shared-data-service.component";

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

  private readonly baseUrl = environment.apiUrl;


  private get profilesUrl(): string {
    return `${this.baseUrl}/profiles`;
  }

  private get reviewUrl(): string {
    return `${this.baseUrl}/review`;
  }

  constructor(private http: HttpClient) {}

  /**
   * USed to retrieve all profiles - primarily for admin console
   */
  getAllProfiles(page: number = 0, size: number = 8, sort: string = 'displayName,asc'): Observable<{ profiles: Profile[]; totalElements: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ProfileResponse>(this.profilesUrl, { params }).pipe(
      map(response => ({
        profiles: this.mapProfiles(response.content),
        totalElements: response.totalElements,
      })),
      catchError(error => {
        console.error('Error fetching all profiles:', error);
        return throwError(() => error);
      })
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

    return this.http.post<ProfileResponse>(`${this.profilesUrl}/search`, searchParams, { params }).pipe(
      map(response => ({
        profiles: this.mapProfiles(response.content),
        totalElements: response.totalElements,
      }))
    );
  }

  /**
   * Retrieve Reviews for a given profile
   * @param profileId
   */
  public getProfileReviews(profileId: number): Observable<Review[]> {
    const url = `${this.reviewUrl}/${profileId}`;
    return this.http.get<any[]>(url).pipe(
      map(rawReviews => this.mapReviews(rawReviews)),
      catchError(error => {
        console.error(`Error fetching reviews for profile ${profileId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Retrieve full profile by its id
   * @param id unique id of the profile to fetch
   */
  getProfileById(id: number): Observable<Profile> {
    const url = `${this.profilesUrl}/${id}`;
    return this.http.get<Profile>(url).pipe(
      map(response => this.mapProfiles([response])[0]),
      catchError(error => {
        console.error(`Error fetching profile with id ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Retrieve full profile by its user id
   * @param userId
   */
  public getProfileByAppUserId(userId: number) {
    const url = `${this.profilesUrl}/profile/${userId}`;

    return this.http.get<Profile>(url).pipe(
      map(response => this.mapProfiles([response]))
    ).pipe(
      map(profiles => profiles[0])
    );
  }

  /**
   * Update a given profiles details
   * @param profile profile to update
   */
  public updateProfile(profile: Profile): Observable<any> {
    const url = `${this.profilesUrl}/update`;
    return this.http.put(url, profile);
  }

  /**
   * Update pricing for a given profile
   * @param priceSet the updated set of prices to assign to profile
   * @param profile the profie to update
   */
  public updateProfilePricing(priceSet: Price[], profile: Profile): Observable<any> {
    // Map human-readable strings to backend enum format
    const transformedPriceSet = priceSet.map(price => ({
      ...price,
      period: Object.keys(PeriodMap).find(key => PeriodMap[key as keyof typeof PeriodMap] === price.period) || price.period // Convert string to enum
    }));

    console.log('Transformed Prices for Backend:', transformedPriceSet);

    const url = `${this.profilesUrl}/update/pricing/${profile.id}`;
    // Return the HTTP PUT observable
    return this.http.put(url, transformedPriceSet);
  }

  /**
   * Update the combination of qualifications and instruments for a profile
   * @param qualificationsToSubmit the set of qualifications to assign
   * @param profile the profile to update
   */
  public updateProfileQualifications(
    qualificationsToSubmit: { qualificationId: number; instrumentId: number }[],
    profile: Profile
  ): Observable<any>{
    const url = `${this.profilesUrl}/update/qualifications/${profile.id}`;
    return this.http.put(url, qualificationsToSubmit);
  }

  /**
   * Map incoming response to profile interface (either tutor or student)
   * @param rawProfiles raw data to map
   * @private
   */
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

  /**
   * Map raw review data to interface
   * @param rawReviews
   * @private
   */
  private mapReviews(rawReviews: any[]): Review[] {
    console.log('Reviews', rawReviews)
    return rawReviews.map(review => {
      if(rawReviews != null) {
        return this.mapToReview(review);
      } else {
      throw new Error('Empty Review')}});
  }


  /**
   * Map raw profile data to tutor profile interface
   * @param profile profile to map
   * @private
   */
  private mapToTutorProfile(profile: any): TutorProfile {
    return {
      enrolledStudents: 0,
      profilePicture: profile.profilePicture,
      qualifications: profile.qualifications,
      averageRating: profile.averageRating,
      reviews:[],
      id: profile.id,
      displayName: profile.displayName,
      instrumentQuals:[],
      bio: profile.bio,
      lessonType:profile.lessonType,
      profileType: profile.profileType,
      instruments: profile.instruments,
      appUserId: profile.appUserId,
      prices: profile.prices.map(this.mapPriceFormatBackendToFrontend.bind(this)),
      genres:profile.genres,
      tuitionRegion: profile.tuitionRegion
    };
  }


  /**
   * Map raw profile data to student profile interface
   * @param profile profile to map
   * @private
   */
  private mapToStudentProfile(profile: any): StudentProfile {
    return {
      qualifications: [],
      completedCourses: [],
      grades: [],
      averageRating: profile.averageRating,
      instruments: profile.instruments,
      profilePicture: profile.profilePicture,
      reviews: [],
      id: profile.id,
      displayName: profile.displayName,
      instrumentQuals:[],
      bio: profile.bio,
      lessonType: profile.lessonType,
      profileType: profile.profileType,
      appUserId: profile.appUserId,
      enrolledCourses: [],
      genres:profile.genres,
      tuitionRegion: profile.tuitionRegion
    };
  }

  /**
   * review mapper
   * @param review raw review to map
   * @private
   */
  private mapToReview(review: any): Review {
    return {
      comment: review.comment,
      rating: review.rating,
      title:review.title,
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

  public getProfileQualificationsById(profileId: number) {
    return this.http.get<InstrumentQualification[]>(`${this.baseUrl}/profiles/instrumentQualifications/${profileId}`);
  }

  createReview(reviewDto: {
    reviewerProfileId: number;
    reviewerName: string;
    profileId: number;
    rating: number;
    tuitionId:number
    comment: string;
    title: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/review`, reviewDto).pipe(
      catchError((error) => {
        console.error('Error creating review:', error);
        throw error;
      })
    );
  }
}
