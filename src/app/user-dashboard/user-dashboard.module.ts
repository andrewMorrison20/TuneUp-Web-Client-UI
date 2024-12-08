import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDashboardRoutingModule } from './user-dashboard-routing.module';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MyTuitionsComponent } from './my-tuitions/my-tuitions.component';
import { StudyHubComponent } from './study-hub/study-hub.component';
import { PaymentsComponent } from './payments/payments.component';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {HttpClientModule} from "@angular/common/http";
import {NavModule} from "../components/nav/nav.module";
import {ChatsComponent} from "./chats/chats.component";
import {FormsModule} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatInput} from "@angular/material/input";
import {UpdateProfileComponent} from "./update-profile/update-profile.component";
import {UserDashboardComponent} from "./user-dashboard.component";

@NgModule({
  declarations: [
    UserDashboardComponent,
    UpdateProfileComponent,
    SidebarComponent,
    MyTuitionsComponent,
    StudyHubComponent,
    PaymentsComponent,
    ChatsComponent
  ],
  exports: [
    SidebarComponent
  ],
  imports: [
    CommonModule,
    UserDashboardRoutingModule,
    HttpClientModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatLabel,
    MatIconModule,
    MatButtonModule,
    NavModule,
    FormsModule,
    MatFormField,
    MatSelect,
    MatOption,
    MatInput
  ]
})
export class UserDashboardModule { }
