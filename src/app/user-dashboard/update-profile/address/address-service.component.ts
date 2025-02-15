import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:8080/api/addresses'; // Backend API Base URL

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
}
