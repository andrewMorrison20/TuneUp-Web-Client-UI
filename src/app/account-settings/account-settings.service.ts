import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

export interface AccountResponse{
  id: number,
  name: string,
  email: string,
  password: string,
  username: string,
  address?: {
    postcode: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    country: string;
  }
}

@Injectable()
export class AccountSettingsService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {

  }

  public getUserAccountDetails(id: number): Observable<AccountResponse> {
    const reqUrl = `${this.apiUrl}/users/${id}`;
    return this.http.get<AccountResponse>(reqUrl);
  }

  public updateUserDetails(id: number, updateData: Partial<AccountResponse>): Observable<AccountResponse> {
    const reqUrl = `${this.apiUrl}/users/update`;
    const payload = { id, ...updateData };
    return this.http.put<AccountResponse>(reqUrl, payload);
  }

  public deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/anonymise`);
  }
}
