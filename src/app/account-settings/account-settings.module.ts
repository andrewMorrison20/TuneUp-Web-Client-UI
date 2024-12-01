import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AccountSettingsComponent} from "./account-settings.component";
import {MatCard, MatCardContent, MatCardModule, MatCardTitle} from "@angular/material/card";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {ReactiveFormsModule} from "@angular/forms";
import {MatIconModule} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {NavModule} from "../components/nav/nav.module";
import {HttpClientModule} from "@angular/common/http";
import {AccountSettingsRoutingModule} from "./account-settings-routing.module";



@NgModule({
  declarations: [
    AccountSettingsComponent,
  ],
  imports: [
    CommonModule,
    MatCard,
    MatCardTitle,
    MatLabel,
    MatCardContent,
    MatFormField,
    MatCardModule,
    MatIconModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatButton,
    MatInput,
    NavModule,
    AccountSettingsRoutingModule,
  ]
})
export class AccountSettingsModule { }
