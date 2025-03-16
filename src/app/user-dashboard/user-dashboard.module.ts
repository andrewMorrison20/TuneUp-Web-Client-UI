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
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormField, MatHint, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatInput} from "@angular/material/input";
import {UpdateProfileComponent} from "./update-profile/update-profile.component";
import {UserDashboardComponent} from "./user-dashboard.component";
import {AccountSettingsModule} from "../account-settings/account-settings.module";
import {FooterModule} from "../components/footer/footer.module";
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {MyTuitionsModule} from "./my-tuitions/my-tuitions.module";
import {AddressService} from "./update-profile/address/address-service.component";
import {ScheduleComponent} from "./schedule/schedule.component";
import {FullCalendarModule} from "@fullcalendar/angular";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {ScheduleAdjustmentDialogComponent} from "./schedule/schedule-adjustment-dialogue.component";
import {MatDialogActions, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatPaginator} from "@angular/material/paginator";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow,
  MatRowDef, MatTable
} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {PaymentsService} from "./payments/payments.service";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {DeleteConfirmationDialog} from "./payments/DeleteConfirmationDialog";
import {InvoiceDialogComponent} from "./payments/Invoice-dialogue.component";
import {NewConversationDialogueComponent} from "./chats/new-conversation-dialogue.component";
import {ChatDialogueComponent} from "./chats/chat-dialogue.component";



@NgModule({
  declarations: [
    UserDashboardComponent,
    UpdateProfileComponent,
    ScheduleAdjustmentDialogComponent,
    SidebarComponent,
    StudyHubComponent,
    PaymentsComponent,
    ChatDialogueComponent,
    ChatsComponent,
    PaymentsComponent,
    ScheduleComponent,
    DeleteConfirmationDialog,
    InvoiceDialogComponent,
    NewConversationDialogueComponent
  ],
  exports: [
    SidebarComponent
  ],
  imports: [
    CommonModule,
    MyTuitionsModule,
    UserDashboardRoutingModule,
    MatDialogActions,
    MatOption,
    AccountSettingsModule,
    FullCalendarModule,
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
    MatLabel,
    MatOption,
    MatSelect,
    MatCard,
    MatTabGroup,
    MatTab,
    MatProgressSpinner,
    MatCardFooter,
    MatCardContent,
    MatCardHeader,
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    MatDatepickerToggle,
    MatDatepicker,
    MatCheckbox,
    MatDatepickerInput,
    MatPaginator,
    MatHeaderRow,
    MatRow,
    MatHeaderCell,
    MatColumnDef,
    MatCell,
    MatCellDef,
    MatRowDef,
    MatHeaderRowDef,
    MatHeaderCellDef,
    MatTable,
    MatSort,
    ReactiveFormsModule,
    MatMenu,
    MatMenuTrigger
  ],

  providers:[AddressService,PaymentsService]
})
export class UserDashboardModule { }
