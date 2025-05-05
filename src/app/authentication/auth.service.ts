import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { AuthenticatedUser } from "./authenticated-user.class";

@Injectable()
export class AuthService {
  public jwtHelper: JwtHelperService = new JwtHelperService();
  private readonly tokenRefreshThreshold = 10000;
  private refreshInterval: any;

  constructor(private http: HttpClient, private router: Router) {}

  public login(user: string, roles: string [], token: string, refreshToken: string, authType: string, id: number,profileId:number,profileType:string) {
    const authenticatedUser = new AuthenticatedUser(user, roles, token, authType, id,profileId,profileType);
    sessionStorage.setItem(AuthenticatedUser.key, authenticatedUser.toString());
    this.startTokenRefreshCycle(authenticatedUser);
  }

  public logout() {
    this.clearAuthenticationCredentials();
    this.router.navigate(['/login']);
  }

  public clearAuthenticationCredentials() {
    AuthenticatedUser.deleteObj();
    sessionStorage.removeItem(AuthenticatedUser.key);
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  private startTokenRefreshCycle(authenticatedUser: AuthenticatedUser) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    const refreshTime = this.getRefreshTime(authenticatedUser.token);
    this.refreshInterval = setInterval(() => {
      this.performTokenRefresh(authenticatedUser);
    }, refreshTime);
  }

  private performTokenRefresh(authenticatedUser: AuthenticatedUser) {
    const refreshHeaders = new HttpHeaders().set('Authorization', `Bearer ${authenticatedUser.token}`);
    this.http.post('/auth/refresh-token', {}, { headers: refreshHeaders }).subscribe(
      (response: any) => {
        authenticatedUser.token = response.token;
        sessionStorage.setItem(AuthenticatedUser.key, authenticatedUser.toString());
      },
      (error) => {
        console.error('Token refresh failed:', error);
        this.logout(); // Logout user on refresh failure
      }
    );
  }

  private getRefreshTime(token: string): number {
    const decodedJWT = this.jwtHelper.decodeToken(token);
    const currentTime = new Date().getTime();
    const expirationTime = decodedJWT.exp * 1000;
    const refreshTime = expirationTime - currentTime;

    return Math.max(refreshTime - this.tokenRefreshThreshold, 0);
  }
}
