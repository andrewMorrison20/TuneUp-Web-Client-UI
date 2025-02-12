import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {AvailabilityService} from "../availability.service";
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";

@Component({
  selector: 'app-lesson-request-dialog',
  templateUrl: './lesson-request-dialog.component.html',
  styleUrls: ['./lesson-request-dialog.component.scss']
})
export class LessonRequestDialogComponent implements OnInit {
  selectedLessonType: string | null = null;
  selectedSlot!: { startTime: Date; endTime: Date };
  availableSlots: { startTime: Date; endTime: Date }[] = [];
  lessonTypes: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<LessonRequestDialogComponent>,
    private availabilityService: AvailabilityService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.calculateAvailableSlots();
    this.lessonTypes = this.getLessonTypes();
  }

  /** 🔹 Precompute Available Slots */
  private calculateAvailableSlots(): void {
    const start = new Date(this.data.startTime);
    const end = new Date(this.data.endTime);
    const increments = [15,30, 45, 60]; // Lesson duration options in minutes

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


  private toLocalISOString(date: Date): string {
    const tzOffset = date.getTimezoneOffset() * 60000; // Get timezone offset in milliseconds
    const localTime = new Date(date.getTime() - tzOffset); // Adjust time to local timezone
    return localTime.toISOString().slice(0, -1); // Remove trailing 'Z' (UTC indicator)
  }

  /** 🔹 Submit Lesson Request */
  onRequest(): void {
    const startTimeLocal = this.toLocalISOString(this.selectedSlot.startTime);
    const endTimeLocal = this.toLocalISOString(this.selectedSlot.endTime);

    console.log("Sending request with times:", startTimeLocal, endTimeLocal); // Debugging

    this.availabilityService.sendAvailabilityRequest(
      startTimeLocal,
      endTimeLocal,
      AuthenticatedUser.getAuthUserProfileId(),
      this.data.profileId,
      this.data.availabilityId,
      this.selectedLessonType

    ).subscribe({
      next: () => {
        console.log("Lesson request sent and calendar refreshed.");
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error("Error sending lesson request", err);
        alert("Failed to send request: " + (err.error?.message || "Please try again."));
        this.dialogRef.close(false);
      }
    });
  }

  getLessonTypes(): string[] {
    const lessonMap: Record<string, string[]> = {
      "online & in-person": ["Online", "In Person"],
      "online": ["Online"],
      "in person": ["In Person"]
    };

    return lessonMap[this.data.lessonType.toLowerCase()] || [];
  }


  /** 🔹 Cancel Dialog */
  onCancel(): void {
    this.dialogRef.close();
  }
}
