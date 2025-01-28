import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { LessonRequestDialogComponent } from './lesson-request/lesson-request-dialog.component';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {AvailabilityService} from "./availability.service";

@NgModule({
  declarations: [LessonRequestDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    HttpClientModule,
    MatFormField,
    MatLabel,
    MatSelect,
    FormsModule,
    MatOption
  ],
  providers:[AvailabilityService],
  exports: [LessonRequestDialogComponent]
})
export class LessonsModule {}
