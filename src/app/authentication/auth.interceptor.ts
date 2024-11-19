import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import {AuthenticatedUser} from "./authenticated-user.class";
import {Injectable} from "@angular/core";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = AuthenticatedUser.getAuthUserToken();
    console.log('Getting auth token for username: ', AuthenticatedUser.getAuthenticatedUser());
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
}
