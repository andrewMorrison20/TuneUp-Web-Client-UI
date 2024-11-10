import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TutorProfile } from './interfaces/tutor.model';
import { StudentProfile } from './interfaces/student.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient) {}

  getTutorProfile(id: string) {
    return this.http.get<TutorProfile>(`/api/users/tutors/${id}`);
  }

   getStudentProfile(id: string) {
    return this.http.get<StudentProfile>(`/api/users/students/${id}`);
  }
}
