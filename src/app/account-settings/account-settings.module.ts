import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AccountSettingsComponent} from "./account-settings.component";
import {MatCard, MatCardContent, MatCardModule, MatCardTitle} from "@angular/material/card";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatIconModule} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {NavModule} from "../components/nav/nav.module";
import {HttpClientModule} from "@angular/common/http";
import {AccountSettingsRoutingModule} from "./account-settings-routing.module";
import {MatOption, MatSelect} from "@angular/material/select";
import {AccountSettingsService} from "./account-settings.service";
import {MatList, MatListItem} from "@angular/material/list";
import {ConfirmDeleteDialogComponent} from "./confirm-delete-dialog.component";
import {MatDialogActions, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";



@NgModule({
  declarations: [
    AccountSettingsComponent,
    ConfirmDeleteDialogComponent
  ],
  providers:[
    AccountSettingsService,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MatCard,
    MatCardTitle,
    MatLabel,
    MatCardContent,
    MatFormField,
    MatCardModule,
    MatIconModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatOption,
    MatButton,
    MatInput,
    NavModule,
    AccountSettingsRoutingModule,
    MatSelect,
    MatList,
    MatListItem,
    FormsModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
  ]
})
export class AccountSettingsModule { }
