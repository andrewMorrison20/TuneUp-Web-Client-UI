import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SignupComponent} from "./signup.component";
import {guestGuard} from "../authentication/guards/guest-guard";


const routes: Routes = [
  { path: '', component: SignupComponent,canActivate: [guestGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignupRoutingModule { }
