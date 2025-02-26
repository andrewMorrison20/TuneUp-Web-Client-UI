import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserDashboardComponent } from './user-dashboard.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { MyTuitionsComponent } from './my-tuitions/my-tuitions.component';
import { StudyHubComponent } from './study-hub/study-hub.component';
import { PaymentsComponent } from './payments/payments.component';
import { ChatsComponent } from './chats/chats.component';
import {AccountSettingsComponent} from "../account-settings/account-settings.component";
import {authGuard} from "../authentication/guards/auth-guard";
import {TuitionSummaryComponent} from "./my-tuitions/tuition-summary/tuition-summary.component";
import {ScheduleComponent} from "./schedule/schedule.component";
import {profileTypeGuard} from "../authentication/guards/profile-type-guard";


const routes: Routes = [
  {
    path: '',
    component: UserDashboardComponent, // Layout Component
    children: [
      { path: 'update-profile', component: UpdateProfileComponent },
      { path: 'my-tuitions', component: MyTuitionsComponent },
      { path: 'study-hub', component: StudyHubComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'chats', component: ChatsComponent },
      { path: 'settings', component: AccountSettingsComponent },
      { path: 'tuition-summary/:id', component: TuitionSummaryComponent},
      { path: 'schedule', component: ScheduleComponent,
        canActivate: [profileTypeGuard], data: { expectedProfileType: 'Tutor' }},
      { path: '', redirectTo: 'my-tuitions', pathMatch: 'full' } // Default route
    ],canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserDashboardRoutingModule {}
