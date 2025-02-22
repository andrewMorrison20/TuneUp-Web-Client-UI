// availability-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-schedule-adjustment-dialog',
  templateUrl: './schedule-adjustment-dialogue.html',
})
export class ScheduleAdjustmentDialogComponent {
  selectedStartTime: string;
  selectedEndTime: string;
  isEditMode: boolean;

  constructor(
    public dialogRef: MatDialogRef<ScheduleAdjustmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedStartTime =  this.formatDateForInput(data.startTime);
    this.selectedEndTime =  this.formatDateForInput(data.endTime);
    this.isEditMode = data.isEditMode;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close({
      startTime: this.selectedStartTime,
      endTime: this.selectedEndTime,
      action: this.isEditMode ? 'update' : 'create'
    });
  }

  onDelete(): void {
    this.dialogRef.close({ action: 'delete' });
  }

  formatDateForInput(date: string): string {
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const adjustedDate = new Date(d.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().slice(0, 16); // Correct format: yyyy-MM-ddTHH:mm
  }

}
