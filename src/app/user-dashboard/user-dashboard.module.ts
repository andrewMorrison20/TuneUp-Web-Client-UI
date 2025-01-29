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
import {MatFormField, MatHint, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatInput} from "@angular/material/input";
import {UpdateProfileComponent} from "./update-profile/update-profile.component";
import {UserDashboardComponent} from "./user-dashboard.component";
import {AccountSettingsModule} from "../account-settings/account-settings.module";
import {FooterModule} from "../components/footer/footer.module";
import {MatCard, MatCardSubtitle, MatCardTitle} from "@angular/material/card";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {LessonRequestsComponent} from "./my-tuitions/lesson-requests.component";
import {ActiveTuitionsComponent} from "./my-tuitions/active-tuitions.component";
import {PreviousTuitionsComponent} from "./my-tuitions/previous-tuitions.component";
import {MyTuitionsModule} from "./my-tuitions/my-tuitions.module";

@NgModule({
  declarations: [
    UserDashboardComponent,
    UpdateProfileComponent,
    SidebarComponent,
    StudyHubComponent,
    PaymentsComponent,
    ChatsComponent,
  ],
  exports: [
    SidebarComponent
  ],
  imports: [
    CommonModule,
    MyTuitionsModule,
    UserDashboardRoutingModule,
    AccountSettingsModule,
    HttpClientModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatHint,
    MatLabel,
    MatIconModule,
    MatButtonModule,
    NavModule,
    FormsModule,
    MatFormField,
    MatSelect,
    MatOption,
    MatInput,
    FooterModule,
    MatCardSubtitle,
    MatCardTitle,
    MatCard,
    MatTabGroup,
    MatTab
  ]
})
export class UserDashboardModule { }
