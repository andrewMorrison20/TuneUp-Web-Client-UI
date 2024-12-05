import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private API_URL = 'http://api.positionstack.com/v1/forward';
  private API_KEY = '0bca8608bbf6449e15e05fd105c93569'; // Replace with your actual Positionstack API key

  constructor(private http: HttpClient) {}

  /**
   * Fetch address data using Positionstack API based on a query (e.g., postcode).
   * @param query - The search query (e.g., postcode or partial address)
   * @returns Observable containing address data
   */
  getAddressByQuery(query: string): Observable<any> {
    const url = `${this.API_URL}?access_key=${this.API_KEY}&query=${encodeURIComponent(query)}`;
    return this.http.get(url);
  }
}
