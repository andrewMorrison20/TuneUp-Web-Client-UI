import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AuthService} from "./auth.service";
import {AuthenticatedUser} from "./authenticated-user.class";
import {JWT_OPTIONS, JwtHelperService} from "@auth0/angular-jwt";
import { JwtModule } from '@auth0/angular-jwt'


export function jwtOptionsFactory() {
  return {
    tokenGetter: () => {
      return localStorage.getItem('access_token');  // Or any other storage mechanism you use
    },
    allowedDomains: ['http://localhost:8080'],  // Allow JWT token to be sent to localhost:8080
    disallowedRoutes: ['http://localhost:8080/auth/login'],
  };
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory
      }
    })
  ],
  providers: [
    AuthService,
    JwtHelperService
  ],
  exports: [

  ]
})
export class AuthenticationModule { }
