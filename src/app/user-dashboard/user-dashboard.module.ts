import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDashboardRoutingModule } from './user-dashboard-routing.module';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
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

@NgModule({
  declarations: [
    SidebarComponent,
    UpdateProfileComponent,
    MyTuitionsComponent,
    StudyHubComponent,
    PaymentsComponent
  ],
  imports: [
    CommonModule,
    UserDashboardRoutingModule,
    HttpClientModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    NavModule
  ]
})
export class UserDashboardModule { }
