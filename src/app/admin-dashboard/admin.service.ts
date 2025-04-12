import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  /**
   * Sends a batch of user IDs to the backend for soft deletion.
   * Only accessible by admins.
   * @param userIds Array of user IDs to be soft deleted.
   */
  softDeleteUsers(userIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/softDeleteBatch`, userIds);
  }
}
