import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {AuthenticatedUser} from "../authentication/authenticated-user.class";
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private baseUrl = 'http://localhost:8080/api/lessonRequest';
  private baseTuitionUrl = 'http://localhost:8080/api/tuitions';
  private url = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {

  }

  createAvailability(profileId:number, startTime:string,endTime: string) {

    const availability = { profileId, startTime, endTime };
    return this.http.post(`${this.url}/availability/${profileId}`, availability);
  }

  sendAvailabilityRequest(
    startTime: string,
    endTime: string,
    studentId: number,
    tutorId: number,
    availabilityId: number,
    lessonType: string | null
  ): Observable<any> {
    const requestBody = {
      requestedStartTime: startTime,
      requestedEndTime: endTime,
      studentProfileId: studentId,
      tutorProfileId: tutorId,
      status: "PENDING",
      availabilityId: availabilityId,
      lessonType:lessonType
    };

    return this.http.post(`${this.baseUrl}`, requestBody);
  }

  getLessonRequestsByIds(studentId: number, tutorId: number, page: number = 0, size: number = 10): Observable<any> {
    const authToken = AuthenticatedUser.getAuthUserToken() // Manually get token, this SHOULDNT be required, but interceptor seems to be bypassing this request
    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
    const params = {
      studentId: studentId.toString(),
      tutorId: tutorId.toString(),
      page: page.toString(),
      size: size.toString()
    };

    return this.http.get(`${this.baseUrl}`, { params, headers });
  }


  fetchRequestProfiles(profileId: number, page: number = 0, size: number = 10): Observable<any> {
    const params = {
      page: page.toString(),
      size: size.toString(),
    };
    return this.http.get(`${this.baseUrl}/students/${profileId}`, {params});
  }

  updateLessonRequestStatus(
    requestId: number,
    status: 'CONFIRMED' | 'DECLINED',
    autoDeclineConflicts = false
  ): Observable<any> {
    const authToken = AuthenticatedUser.getAuthUserToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);

    const requestBody = {
      status,
      autoDeclineConflicts,
    };

    return this.http.patch(`${this.baseUrl}/status/${requestId}`, requestBody, { headers });
  }


  fetchTuitions(profileId: number, active: boolean = true, page: number = 0, size: number = 10): Observable<any> {
    const params = {
      page: page.toString(),
      size: size.toString(),
      active: active.toString()
    };
    return this.http.get(`${this.baseTuitionUrl}/tuitionsByProfile/${profileId}`, { params });
  }

  getTuitionSummary(studentProfileId: number, tutorProfileId: number): Observable<any> {
    const params = {
      studentProfileId: studentProfileId.toString(),
      tutorProfileId: tutorProfileId.toString(),
    };
    return this.http.get(`${this.baseTuitionUrl}/byStudentAndTutor`, { params });
  }


  public getTuitionLessonSummary(tuitionId: number, start: string, end: string): Observable<any[]> {
    const url = `${this.url}/lessons/${tuitionId}`;
    const token = AuthenticatedUser.getAuthUserToken();

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<any[]>(url, { params: { start, end }, headers }).pipe(
      tap(() => console.log('Request Sent Successfully'))
    );
  }

  cancelLesson(lessonId: number) {

  }

  getAllLessons(profileId: number, start: string, end: string): Observable<any> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);

    return this.http.get(`${this.url}/lessons/profileLessons/${profileId}`, { params });
  }


}



