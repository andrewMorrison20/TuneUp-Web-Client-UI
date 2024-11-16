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


@NgModule({
  declarations: [SignupComponent],
    imports: [
        CommonModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        SignupRoutingModule,
        MatCardContent,
        MatCardTitle,
        MatCard,
        MatCardActions,
        MatCardFooter,
        MatCheckbox,
        MatProgressSpinner
    ]
})

export class SignupModule { }
