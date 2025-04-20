import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDashboardRoutingModule } from './user-dashboard-routing.module';
import { PaymentsComponent } from './payments/payments.component';
import {NavModule} from "../components/nav/nav.module";
import {ChatsComponent} from "./chats/chats.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UpdateProfileComponent} from "./update-profile/update-profile.component";
import {UserDashboardComponent} from "./user-dashboard.component";
import {AccountSettingsModule} from "../account-settings/account-settings.module";
import {FooterModule} from "../components/footer/footer.module";
import {MyTuitionsModule} from "./my-tuitions/my-tuitions.module";
import {AddressService} from "./update-profile/address/address-service.component";
import {ScheduleComponent} from "./schedule/schedule.component";
import {FullCalendarModule} from "@fullcalendar/angular";
import {ScheduleAdjustmentDialogComponent} from "./schedule/schedule-adjustment-dialogue.component";
import {PaymentsService} from "./payments/payments.service";
import {DeleteConfirmationDialog} from "./payments/DeleteConfirmationDialog";
import {InvoiceDialogComponent} from "./payments/Invoice-dialogue.component";
import {NewConversationDialogueComponent} from "./chats/new-conversation-dialogue.component";
import {ChatDialogueComponent} from "./chats/chat-dialogue.component";
import {SharedModule} from "../shared/shared.module";



@NgModule({
  declarations: [
    UserDashboardComponent,
    UpdateProfileComponent,
    ScheduleAdjustmentDialogComponent,
    PaymentsComponent,
    ChatDialogueComponent,
    ChatsComponent,
    PaymentsComponent,
    ScheduleComponent,
    DeleteConfirmationDialog,
    InvoiceDialogComponent,
    NewConversationDialogueComponent
  ],
  imports: [
    CommonModule,
    MyTuitionsModule,
    UserDashboardRoutingModule,
    AccountSettingsModule,
    FullCalendarModule,
    NavModule,
    FormsModule,
    FooterModule,
    SharedModule,
    ReactiveFormsModule,
  ],

  providers:[AddressService,PaymentsService]
})
export class UserDashboardModule { }
