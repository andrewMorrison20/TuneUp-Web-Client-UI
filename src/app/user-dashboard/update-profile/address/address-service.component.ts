import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthenticatedUser} from "../../../authentication/authenticated-user.class";

export interface AddressDto {
  id: number;
  postcode: string;
  city: string;
  country: string;
  addressLine1: string;
  addressLine2?: string;
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = 'http://localhost:8080/api/addresses';

  constructor(private http: HttpClient) {}

  /**
   * Fetches address suggestions based on postcode & street name.
   * Calls backend API to get geocoded addresses.
   *
   * @param postcode - The postcode to search for
   * @param streetName - The street name (or first address line)
   * @returns Observable<AddressDto[]> - List of matched addresses
   */
  getAddressSuggestions(postcode: string, streetName: string): Observable<AddressDto[]> {
    const params = new HttpParams()
      .set('postcode', postcode)
      .set('streetName', streetName);

    return this.http.get<AddressDto[]>(`${this.apiUrl}/lookup`, { params });
  }

  /** Fetch tutor's location for a given tuition ID */
  //Again issues with Angulars interceptor, this has no reason to bypass the interceptor, but it does (yet other reqs
  // in this class do no. Auth attached manually, until this is resolved.
  getLessonTutorLocation(tuitionId: number): Observable<AddressDto> {
    const authToken = AuthenticatedUser.getAuthUserToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);

    return this.http.get<AddressDto>(`${this.apiUrl}/lesson/${tuitionId}/location`, { headers });
  }

}
