import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { AuthenticatedUser } from "./authenticated-user.class";

@Injectable()
export class AuthService {
  /** JWT utility for decoding and expiration checks */
  public jwtHelper = new JwtHelperService();

  /** How many ms before expiry to attempt a refresh */
  private readonly tokenRefreshThreshold = 10_000;

  /** Handle for our periodic refresh timer */
  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Store user credentials in sessionStorage and kick off auto-refresh.
   * @param user     username or identifier
   * @param roles    granted roles/authorities
   * @param token    initial JWT
   * @param refreshToken  refresh token (if used)
   * @param authType     e.g. “Bearer”
   * @param id           app-user ID
   * @param profileId    linked profile ID
   * @param profileType  “Tutor” | “Student”
   */
  public login(
    user: string,
    roles: string[],
    token: string,
    refreshToken: string,
    authType: string,
    id: number,
    profileId: number,
    profileType: string
  ) {
    const authenticatedUser = new AuthenticatedUser(
      user, roles, token, authType, id, profileId, profileType
    );
    sessionStorage.setItem(
      AuthenticatedUser.key,
      authenticatedUser.toString()
    );
    this.startTokenRefreshCycle(authenticatedUser);
  }

  /** Clears stored credentials and navigates to the login page. */
  public logout() {
    this.clearAuthenticationCredentials();
    this.router.navigate(['/login']);
  }

  /** Remove sessionStorage entry and stop any refresh timer. */
  public clearAuthenticationCredentials() {
    AuthenticatedUser.deleteObj();
    sessionStorage.removeItem(AuthenticatedUser.key);
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Begin a timer that will call `performTokenRefresh` shortly
   * before the JWT expires.
   */
  private startTokenRefreshCycle(user: AuthenticatedUser) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    const refreshTime = this.getRefreshTime(user.token);
    this.refreshInterval = setInterval(() => {
      this.performTokenRefresh(user);
    }, refreshTime);
  }

  /**
   * Make a call to your back end to swap in a fresh JWT.
   * Logs the user out if the refresh fails.
   */
  private performTokenRefresh(user: AuthenticatedUser) {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${user.token}`);
    this.http.post<{ token: string }>(
      '/auth/refresh-token',
      {},
      { headers }
    ).subscribe({
      next: res => {
        user.token = res.token;
        sessionStorage.setItem(
          AuthenticatedUser.key,
          user.toString()
        );
      },
      error: err => {
        console.error('Token refresh failed:', err);
        this.logout();
      }
    });
  }

  /**
   * Compute ms until token expiration minus the threshold.
   * @param token raw JWT string
   * @returns number of milliseconds until we should refresh
   */
  private getRefreshTime(token: string): number {
    const decoded = this.jwtHelper.decodeToken(token);
    const currentTime = Date.now();
    const expiration = decoded.exp * 1000;
    const untilExpiry = expiration - currentTime;
    return Math.max(untilExpiry - this.tokenRefreshThreshold, 0);
  }
}
