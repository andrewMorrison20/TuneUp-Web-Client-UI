import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyTuitionsComponent } from './my-tuitions.component';
import { LessonRequestsComponent } from './lesson-requests.component';
import { ActiveTuitionsComponent } from './active-tuitions.component';
import { PreviousTuitionsComponent } from './previous-tuitions.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import {MatPaginator} from "@angular/material/paginator";
import {HttpClientModule} from "@angular/common/http";
import {AvailabilityService} from "../../lessons/availability.service";
import {MatButton} from "@angular/material/button";

@NgModule({
  declarations: [
    MyTuitionsComponent,
    LessonRequestsComponent,
    ActiveTuitionsComponent,
    PreviousTuitionsComponent,
  ],
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatPaginator,
    HttpClientModule,
    MatButton
  ],
  providers:[AvailabilityService],
  exports: [MyTuitionsComponent]
})
export class MyTuitionsModule {}
