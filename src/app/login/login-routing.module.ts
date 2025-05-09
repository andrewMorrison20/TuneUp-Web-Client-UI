import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import {ResetPasswordComponent} from "./reset-password/reset-password.component";
import {UpdatePasswordComponent} from "./reset-password/update-password/update-password.component";
import {guestGuard} from "../authentication/guards/guest-guard";
import {EmailVerificationComponent} from "./verify-email/verify-email.component";

const routes: Routes = [
  { path: '', component: LoginComponent,canActivate: [guestGuard] },
  { path: 'reset', component: ResetPasswordComponent,canActivate: [guestGuard] },
  {
    path: 'update-password',
    component: UpdatePasswordComponent,
  },
  { path : 'verified', component: EmailVerificationComponent, canActivate: [guestGuard]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
