import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt'; // Keep JwtHelperService if needed
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    AuthService,
    JwtHelperService, // Optional: Keep for decoding/validating tokens
  ],
})
export class AuthenticationModule {}
