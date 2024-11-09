import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AuthService} from "./auth.service";
import {AuthenticatedUser} from "./authenticated-user.class";



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    AuthService
  ],
  exports: [

  ]
})
export class AuthenticationModule { }
