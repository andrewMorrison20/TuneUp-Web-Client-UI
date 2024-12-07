import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { MyTuitionsComponent } from './my-tuitions/my-tuitions.component';
import { StudyHubComponent } from './study-hub/study-hub.component';
import { PaymentsComponent } from './payments/payments.component';

const routes: Routes = [
  { path: 'update-profile', component: UpdateProfileComponent },
  { path: 'my-tuitions', component: MyTuitionsComponent },
  { path: 'study-hub', component: StudyHubComponent },
  { path: 'payments', component: PaymentsComponent },
  { path: '', redirectTo: 'update-profile', pathMatch: 'full' } // Default route
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserDashboardRoutingModule { }
