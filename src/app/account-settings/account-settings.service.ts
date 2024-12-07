import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";

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
  private baseServerUrl = "http://localhost:8080/api/users";

  constructor(private http: HttpClient) {

  }

  public getUserAccountDetails(id: number): Observable<AccountResponse> {
    const reqUrl = `${this.baseServerUrl}/${id}`;
    return this.http.get<AccountResponse>(reqUrl);
  }

  public updateUserDetails(id: number, updateData: Partial<AccountResponse>): Observable<AccountResponse> {
    const reqUrl = `${this.baseServerUrl}/update`;
    const payload = { id, ...updateData };
    return this.http.put<AccountResponse>(reqUrl, payload);
  }

}
