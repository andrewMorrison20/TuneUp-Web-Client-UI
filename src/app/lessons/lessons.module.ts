import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { LessonRequestDialogComponent } from './lesson-request/lesson-request-dialog.component';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [LessonRequestDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormField,
    MatLabel,
    MatSelect,
    FormsModule,
    MatOption
  ],
  exports: [LessonRequestDialogComponent]
})
export class LessonsModule {}
