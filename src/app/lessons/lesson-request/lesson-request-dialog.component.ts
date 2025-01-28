import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {switchMap} from "rxjs";
import {AvailabilityService} from "../availability.service";

@Component({
  selector: 'app-lesson-request-dialog',
  templateUrl: './lesson-request-dialog.component.html',
  styleUrls: ['./lesson-request-dialog.component.scss']
})
export class LessonRequestDialogComponent implements OnInit {
  selectedInstrument: any;
  selectedSlot!: { startTime: Date; endTime: Date };
  availableSlots: { startTime: Date; endTime: Date }[] = [];

  constructor(
    public dialogRef: MatDialogRef<LessonRequestDialogComponent>,
    private availabilityService: AvailabilityService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.calculateAvailableSlots();
  }

  /** 🔹 Precompute Available Slots */
  private calculateAvailableSlots(): void {
    const start = new Date(this.data.startTime);
    const end = new Date(this.data.endTime);
    const increments = [30, 45, 60]; // Lesson duration options in minutes

    let current = new Date(start);

    while (current < end) {
      for (let inc of increments) {
        let slotEnd = new Date(current.getTime() + inc * 60000);
        if (slotEnd <= end) {
          this.availableSlots.push({ startTime: new Date(current), endTime: slotEnd });
        }
      }
      current = new Date(current.getTime() + 15 * 60000); // Move forward in 15-minute increments
    }

    this.selectedSlot = this.availableSlots[0]; // Default first slot
  }

  /** 🔹 Submit Lesson Request */
  onRequest(): void {
    this.availabilityService.sendAvailabilityRequest(
      this.selectedSlot.startTime.toISOString(),
      this.selectedSlot.endTime.toISOString(),
      this.data.studentId,
      this.data.profileId,
      this.data.availabilityId
    ).pipe(
      switchMap(() => this.data.refreshCalendar()) // Refresh only on success
    ).subscribe({
      next: () => {
        console.log("Lesson request sent and calendar refreshed.");
        this.dialogRef.close();
      },
      error: (err) => {
        console.error("Error sending lesson request", err);
        alert("Failed to send request: " + (err.error?.message || "Please try again."));
        this.dialogRef.close();
      }
    });
  }


  /** 🔹 Cancel Dialog */
  onCancel(): void {
    this.dialogRef.close();
  }
}
