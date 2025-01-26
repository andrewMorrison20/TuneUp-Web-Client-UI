import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-lesson-request-dialog',
  templateUrl: './lesson-request-dialog.component.html',
  styleUrls: ['./lesson-request-dialog.component.scss']
})
export class LessonRequestDialogComponent implements OnInit {
  selectedDuration = 30; // Default duration
  calculatedEndTime!: Date;
  availableDurations: number[] = [];

  constructor(
    public dialogRef: MatDialogRef<LessonRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.calculateAvailableDurations();
    this.updateEndTime();
  }

  private calculateAvailableDurations(): void {
    const start = new Date(this.data.startTime);
    const end = new Date(this.data.endTime);
    let minutesAvailable = (end.getTime() - start.getTime()) / 60000;

    // Allow booking in 30-minute increments up to the available time
    for (let i = 30; i <= minutesAvailable; i += 15) {
      this.availableDurations.push(i);
    }
  }

  updateEndTime(): void {
    const start = new Date(this.data.startTime);
    this.calculatedEndTime = new Date(start.getTime() + this.selectedDuration * 60000);
  }

  onRequest(): void {
    this.dialogRef.close({
      startTime: this.data.startTime,
      endTime: this.calculatedEndTime
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

