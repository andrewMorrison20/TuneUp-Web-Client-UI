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
      status:"PENDNIG",
      availabilityId: availabilityId
    };

    return this.http.post(`${this.baseUrl}`, requestBody);
  }

}
