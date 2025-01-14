import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import {AuthenticatedUser} from "./authenticated-user.class";
import {Injectable} from "@angular/core";
import {AuthService} from "./auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = AuthenticatedUser.getAuthUserToken();
    console.log('Getting auth token for username: ', AuthenticatedUser.getAuthenticatedUser());
    if (token && this.authService.tokenIsValid()) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
      return next.handle(cloned);
    }
    return next.handle(req); // Proceed without token
  }
}
