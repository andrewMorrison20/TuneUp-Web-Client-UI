import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { buildDefaultPostHeaders } from '../data/headers';
import { AuthenticatedUser } from "./authenticated-user.class";

@Injectable()
export class AuthService {
    public jwtHelper: JwtHelperService = new JwtHelperService();

    public refreshInterval: string | number | any | null | undefined;

    private tokenRefreshThreshold = 1000;

    constructor(
        public http:HttpClient, public router: Router
    ) {}


    public login(user: string, _console: string, token: string, refreshToken : string, authType: string){
        const authenticatedUser = new AuthenticatedUser(user,_console, token, refreshToken, authType);
        sessionStorage.setItem(AuthenticatedUser.key, authenticatedUser.toString());
        this.startTokenRefreshCycle(authenticatedUser);
    }

    public startTokenRefreshCycle(authenticatedUser: AuthenticatedUser) {
        if (this.refreshInterval){
            clearInterval(this.refreshInterval);
        }
        this.refreshInterval = null;
        this.refreshInterval = setInterval(() => {
            this.performTokenRefresh(authenticatedUser);
        }, this.getRefreshTime(authenticatedUser.token));
    }

    performTokenRefresh(authenticatedUser: AuthenticatedUser) {
        const refreshHeaders: HttpHeaders = buildDefaultPostHeaders().set('Authorisation', `Bearer ${authenticatedUser.refreshToken}`);
    }

    public clearAuthenticationCredentials(){
        AuthenticatedUser.deleteObj();
    }
    private getRefreshTime(token: string) {
        const decodedJWT = this.jwtHelper.decodeToken(token);
        const refreshTime = decodedJWT.exp * 2000 - new Date().getTime();

        if(refreshTime <= this.tokenRefreshThreshold){
            console.log(`Token life < 10 secs. defaulting to ${refreshTime}`);
            return refreshTime;
        }else {
            return refreshTime - this.tokenRefreshThreshold;
        }
    }

    private tokenIsValid(tokenString: string) {
        return tokenString && tokenString.length > 0 && ! this.jwtHelper.isTokenExpired(tokenString);
    }

}
