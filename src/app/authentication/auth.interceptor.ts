import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import {AuthenticatedUser} from "./authenticated-user.class";
import {Injectable} from "@angular/core";
import {JwtHelperService} from "@auth0/angular-jwt";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = AuthenticatedUser.getAuthUserToken();
    console.log('Getting auth token for username: ', AuthenticatedUser.getAuthenticatedUser());
    if (token) {
      const jwtHelper = new JwtHelperService();
      if (!jwtHelper.isTokenExpired(token)) {
        const cloned = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        });
        return next.handle(cloned);
      } else {
        console.warn('Token is expired and will not be attached.');
      }
    }
    return next.handle(req); // Proceed without token
  }
}

