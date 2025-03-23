import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import {ReactiveFormsModule} from "@angular/forms";
import {AuthenticationModule} from "../authentication/authentication.module";
import {HttpClientModule} from "@angular/common/http";
import {NavModule} from "../components/nav/nav.module";
import {SearchBarModule} from "../components/search-bar/search-bar.module";
import {ResetPasswordComponent} from "./reset-password/reset-password.component";
import {UpdatePasswordComponent} from "./reset-password/update-password/update-password.component";
import {SharedModule} from "../shared/shared.module";
import {LoginComponent} from "./login.component";


@NgModule({
  declarations: [
    LoginComponent,
    ResetPasswordComponent,
    UpdatePasswordComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule,
    LoginRoutingModule,
    NavModule,
    SearchBarModule,
    AuthenticationModule
  ]
})

export class LoginModule { }
