import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

interface AccountResponse{
  id: number,
  name: string,
  email: string,
  password: string,
  username: string
}

@Injectable()
export class AccountSettingsService {
  private baseServerUrl = "http://localhost:8080/api/users";

  constructor(private http: HttpClient) {

  }

  public getUserAccountDetails(){
    const reqUrl = this.baseServerUrl;
    return this.http.get<AccountResponse>(reqUrl)
  }

}
