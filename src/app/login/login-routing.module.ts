import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import {ResetPasswordComponent} from "./reset-password/reset-password.component";  // Import the LoginComponent

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'reset', component: ResetPasswordComponent}// Define the route for the LoginComponent
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
