import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyTuitionsComponent } from './my-tuitions.component';
import { LessonRequestsComponent } from './lesson-requests/lesson-requests.component';
import { ActiveTuitionsComponent } from './active-tuitions/active-tuitions.component';
import { PreviousTuitionsComponent } from './previous-tuitions/previous-tuitions.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import {MatPaginator} from "@angular/material/paginator";
import {AvailabilityService} from "../../lessons/availability.service";
import {MatButton} from "@angular/material/button";
import {ProfileLessonRequestsDialogComponent} from "./lesson-requests/profile-lesson-request/profile-lesson-requests-dialgoue.component";
import {MatDialogActions, MatDialogContent} from "@angular/material/dialog";
import {MatList, MatListItem} from "@angular/material/list";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {TuitionSummaryComponent} from "./tuition-summary/tuition-summary.component";
import {RouterLink} from "@angular/router";
import {FullCalendarModule} from "@fullcalendar/angular";
import {MatCheckbox} from "@angular/material/checkbox";
import {FormsModule} from "@angular/forms";
import {LessonSummaryDialogComponent} from "./tuition-summary/lesson-summary/lesson-summary-dialgoue.component";
import {AddressService} from "../update-profile/address/address-service.component";
import {HttpClientModule} from "@angular/common/http";
import {GoogleMap, MapMarker} from "@angular/google-maps";
import {TuitionsService} from "./tuitions.service";
import {ReviewDialogueComponent} from "./reviews/review-dialogue.component";
import {MatFormField, MatHint, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatDivider} from "@angular/material/divider";

@NgModule({
  declarations: [
    MyTuitionsComponent,
    LessonRequestsComponent,
    ActiveTuitionsComponent,
    PreviousTuitionsComponent,
    ProfileLessonRequestsDialogComponent,
    TuitionSummaryComponent,
    LessonSummaryDialogComponent,
    ReviewDialogueComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MatTabsModule,
    MatCardModule,
    MatPaginator,
    MatButton,
    MatDialogContent,
    MatLabel,
    MatList,
    MatListItem,
    MatDialogActions,
    MatIcon,
    MatProgressSpinner,
    RouterLink,
    FullCalendarModule,
    MatCheckbox,
    FormsModule,
    GoogleMap,
    MapMarker,
    MatHint,
    MatFormField,
    MatInput,
    MatDivider
  ],
  providers:[AvailabilityService,AddressService,TuitionsService,GoogleMap],
  exports: [MyTuitionsComponent,ProfileLessonRequestsDialogComponent]
})
export class MyTuitionsModule {}
