import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignupRoutingModule } from './signup-routing.module';
import {MatFormFieldModule} from "@angular/material/form-field";
import {ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatCard, MatCardActions, MatCardContent, MatCardFooter, MatCardTitle} from "@angular/material/card";
import {MatCheckbox} from "@angular/material/checkbox";
import {SignupComponent} from "./signup.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {HttpClientModule} from "@angular/common/http";
import {NavModule} from "../components/nav/nav.module";
import {MatOption, MatSelect} from "@angular/material/select";
import {SharedModule} from "../shared/shared.module";


@NgModule({
  declarations: [SignupComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    SharedModule,
    SignupRoutingModule,
    NavModule,
    MatOption
  ]
})

export class SignupModule { }
