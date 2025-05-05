import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {AuthenticatedUser} from "../authentication/authenticated-user.class";
import {tap} from "rxjs/operators";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private baseUrl = environment.apiUrl;
  private lessonRequestApiUrl =  this.baseUrl + '/lessonRequest';
  private tuitionApiUrl =  this.baseUrl + '/tuitions';

  constructor(private http: HttpClient) {

  }

  createAvailability(profileId:number, startTime:string,endTime: string) {

    const availability = { profileId, startTime, endTime };
    return this.http.post(`${this.baseUrl}/availability/${profileId}`, availability);
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

    return this.http.post(`${this.lessonRequestApiUrl}`, requestBody);
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

    return this.http.get(`${this.lessonRequestApiUrl}`, { params, headers });
  }


  fetchRequestProfiles(profileId: number, page: number = 0, size: number = 10): Observable<any> {
    const params = {
      page: page.toString(),
      size: size.toString(),
    };
    return this.http.get(`${this.lessonRequestApiUrl}/students/${profileId}`, {params});
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

    return this.http.patch(`${this.lessonRequestApiUrl}/status/${requestId}`, requestBody, { headers });
  }


  fetchTuitions(profileId: number, active: boolean = true, page: number = 0, size: number = 10): Observable<any> {
    const params = {
      page: page.toString(),
      size: size.toString(),
      active: active.toString()
    };
    return this.http.get(`${this.tuitionApiUrl}/tuitionsByProfile/${profileId}`, { params });
  }

  getTuitionSummary(studentProfileId: number, tutorProfileId: number): Observable<any> {
    const params = {
      studentProfileId: studentProfileId.toString(),
      tutorProfileId: tutorProfileId.toString(),
    };
    return this.http.get(`${this.tuitionApiUrl}/byStudentAndTutor`, { params });
  }


  public getTuitionLessonSummary(tuitionId: number, start: string, end: string): Observable<any[]> {
    const url = `${this.baseUrl}/lessons/${tuitionId}`;
    const token = AuthenticatedUser.getAuthUserToken();

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<any[]>(url, { params: { start, end }, headers }).pipe(
      tap(() => console.log('Request Sent Successfully'))
    );
  }


  getAllLessons(profileId: number, start: string, end: string): Observable<any> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);

    return this.http.get(`${this.baseUrl}/lessons/profileLessons/${profileId}`, { params });
  }


  updateAvailability(availabilityId: number, startTime: string, endTime: string) {
    const body = {
      id: availabilityId,
      startTime: startTime,
      endTime: endTime
    };

    const profileId = AuthenticatedUser.getAuthUserProfileId();
    return this.http.patch(`${this.baseUrl}/availability/update/${profileId}`, body);
  }


  deleteAvailability(availabilityId: number) {
    const params = new HttpParams().set('availabilityId', availabilityId.toString());
    const profileId = AuthenticatedUser.getAuthUserProfileId();
    return this.http.delete(`${this.baseUrl}/availability/delete/${profileId}`, { params });
  }


  getPeriodAvailabilityForProfile(profileId: number, start: string, end: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/availability/${profileId}/period`, {
      params: { start, end }
    });
  }

  fetchLessonSummaryByAvailabilityId(availabilityId:number) {
    return this.http.get<any[]>(`${this.baseUrl}/lessons/byAvailability/${availabilityId}`);
  }

  //Again a single method in this class bypassing interceptor, this is incredibly flakey.
  cancelLessonById(id: number, resetAvailability: boolean) {
    const authToken = AuthenticatedUser.getAuthUserToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);

    const params = new HttpParams().set('resetAvailability', String(resetAvailability));

    return this.http.delete<any>(`${this.baseUrl}/lessons/cancel/${id}`, { headers, params });
  }


  batchCreateAvailability(profileId: number, slots: { start: string, end: string }[]) {
    return this.http.post(`${this.baseUrl}/availability/${profileId}/batchCreate`, slots);
  }

  updateLessonStatus(lessonStatus: string, lessonId: number) {
    const authToken = AuthenticatedUser.getAuthUserToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
    const params = new HttpParams().set('lessonStatus', lessonStatus);

    return this.http.patch(`${this.baseUrl}/lessons/updateStatus/${lessonId}`, {}, { headers, params });
  }

}



