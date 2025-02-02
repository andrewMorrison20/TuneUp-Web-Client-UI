import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {AuthenticatedUser} from "../authentication/authenticated-user.class";

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private baseUrl = 'http://localhost:8080/api/lessonRequest';
  private baseTuitionUrl = 'http://localhost:8080/api/tuitions';

  constructor(private http: HttpClient) {

  }

  sendAvailabilityRequest(
    startTime: string,
    endTime: string,
    studentId: number,
    tutorId: number,
    availabilityId: number
  ): Observable<any> {
    const requestBody = {
      requestedStartTime: startTime,
      requestedEndTime: endTime,
      studentProfileId: studentId,
      tutorProfileId: tutorId,
      status: "PENDING",
      availabilityId: availabilityId
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

  updateLessonRequestStatus(requestId: number, status: 'CONFIRMED' | 'DECLINED'): Observable<any> {
    const authToken = AuthenticatedUser.getAuthUserToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);

    return this.http.patch(`${this.baseUrl}/status/${requestId}`, { status }, { headers });
  }

  fetchTuitions(profileId: number, active: boolean = true, page: number = 0, size: number = 10): Observable<any> {
    const params = {
      page: page.toString(),
      size: size.toString(),
      active: active.toString()
    };
    return this.http.get(`${this.baseTuitionUrl}/tuitionsByProfile/${profileId}`, { params });
  }

}



