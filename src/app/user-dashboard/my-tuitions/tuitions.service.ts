import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {tap} from "rxjs/operators";
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";



@Injectable({
  providedIn: 'root'
})
export class TuitionsService {
  private apiUrl = 'http://localhost:8080/api/tuitions';
  private baseUrl = 'http://localhost:8080/api'

  constructor(private http: HttpClient) {
  }

  public deactivateTuition(tuitionId: number): Observable<void> {
    const url = `${this.apiUrl}/${tuitionId}/deactivate`;
    console.log(`Sending PATCH request to: ${url}`);
    return this.http.patch<void>(url, {}).pipe(
      tap(() => console.log(`Tuition ${tuitionId} deactivated successfully`)),
      catchError((error) => {
        console.error('Error in deactivateTuition:', error);
        return throwError(() => error);
      })
    );
  }

  public fetchTuitions(profileId: number, active: boolean = true, page: number = 0, size: number = 10): Observable<any> {
    const params = {
      page: page.toString(),
      size: size.toString(),
      active: active.toString()
    };

    return this.http.get(`${this.apiUrl}/tuitionsByProfile/${profileId}`, {params}).pipe(
      tap(() => console.log(`Fetched tuitions for profileId ${profileId}`)),
      catchError((error) => {
        console.error('Error fetching tuitions:', error);
        return throwError(() => error);
      })
    );
  }

  public fetchTuitionLessons(studentId: number, tutorId: number): Observable<any> {
    const url = `${this.baseUrl}/lessons/completed/${studentId}/${tutorId}`;
    return this.http.get<any>(url).pipe(
      tap((lessons) => console.log(`Fetched ${lessons.length} lessons for tuition relating to ${tutorId}, ${studentId}`)),
      catchError((error) => {
        console.error('Error fetching lessons:', error);
        return throwError(() => error);
      })
    );
  }

  fetchTuitionsNoChatHistory(profileId: number, page: number, size: number, active: boolean) {
    const token = AuthenticatedUser.getAuthUserToken();
    const url = `${this.baseUrl}/chats/noHistory/${profileId}?page=${page}&size=${size}&active=${active}`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<{ content: any[], totalElements: number }>(url, { headers }).pipe(
      tap(response => console.log(`Fetched ${response.content.length} profiles for tuition relating to ${profileId}`)),
      catchError(error => {
        console.error('Error fetching profiles:', error);
        return throwError(() => error);
      })
    );
}
}
