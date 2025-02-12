import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { LessonSummary } from './lesson-summary.model'

@Component({
  selector: 'app-lesson-summary-dialogue',
  templateUrl: './lesson-summary-dialogue.component.html',
})
export class LessonSummaryDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LessonSummaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { lesson: LessonSummary }
  ) {}

  cancelLesson(): void {
    console.log('Cancelling Lesson ID:', this.data.lesson.id);
    this.dialogRef.close('cancelled');
  }

  redirectToStudyHub(): void {
    console.log('Redirecting to Study Hub for Lesson ID:', this.data.lesson.id);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
