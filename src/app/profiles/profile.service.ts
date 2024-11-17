import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TutorProfile } from './interfaces/tutor.model';
import { StudentProfile } from './interfaces/student.model';

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

  constructor(private http: HttpClient) {}

  getProfiles(page: number = 0, size: number = 10, sort: string = 'displayName,asc'): Observable<Profile[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ProfileResponse>(this.apiUrl, { params }).pipe(
      map(response => this.mapProfiles(response.content))
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

  private mapToTutorProfile(profile: any): TutorProfile {
    return {
      enrolledStudents: 0,
      pricing: 0,
      profilePicture: "",
      qualifications: "",
      rating: 0,
      reviews: [],
      id: profile.id,
      name: profile.displayName,
      bio: profile.bio,
      onlineLessons: profile.onlineLessons,
      profileType: profile.profileType,
      instruments: profile.instruments ? profile.instruments.map((instrument: any) => instrument.name) : [],
      appUserId: profile.appUserId
    };
  }


  private mapToStudentProfile(profile: any): StudentProfile {
    return {
      achievements: [],
      completedCourses: [],
      grades: [],
      instruments: [],
      profilePicture: "",
      reviews: [],
      id: profile.id,
      name: profile.displayName,
      bio: profile.bio,
      onlineLessons: profile.onlineLessons,
      profileType: profile.profileType,
      appUserId: profile.appUserId,
      enrolledCourses: []
    };
  }
}
