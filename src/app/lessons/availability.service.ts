import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private baseUrl = 'http://localhost:8080/api/lessonRequest';

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

  getLessonRequestsByIds(studentId: number, tutorId: number): Observable<any> {
    const params = {studentId: studentId.toString(), tutorId: tutorId.toString()};
    return this.http.get(`${this.baseUrl}`, {params});
  }

  fetchRequestProfiles(profileId: number, page: number = 0, size: number = 10): Observable<any> {
    const params = {
      page: page.toString(),
      size: size.toString(),
    };
    return this.http.get(`${this.baseUrl}/students/${profileId}`, { params });
  }
}

