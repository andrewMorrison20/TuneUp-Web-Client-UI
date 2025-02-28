import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {tap} from "rxjs/operators";



@Injectable({
  providedIn: 'root'
})
export class TuitionsService {
  private apiUrl = 'http://localhost:8080/api/tuitions';

  constructor(private http: HttpClient) {}

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

}
