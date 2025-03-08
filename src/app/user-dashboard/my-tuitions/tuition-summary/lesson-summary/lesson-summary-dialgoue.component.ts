import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddressDto, AddressService } from '../../../update-profile/address/address-service.component';
import {LessonSummary} from "./lesson-summary.model";
import {catchError, of, pipe} from "rxjs";
import {tap} from "rxjs/operators";
import {AvailabilityService} from "../../../../lessons/availability.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-lesson-summary-dialogue',
  templateUrl: './lesson-summary-dialogue.component.html',
  styleUrl: './lesson-summary-dialogue.component.scss'
})
export class LessonSummaryDialogComponent implements OnInit {
  latitude!: number;
  longitude!: number;
  zoom: number = 15;
  showMap: boolean = false;
  resetAvailability: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<LessonSummaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { lesson: LessonSummary, address: AddressDto | null },
    private addressService: AddressService,
    private availabilityService: AvailabilityService,
    private router : Router
  ) {}

  ngOnInit(): void {
    console.log('reset : ' ,this.resetAvailability)
    console.log(this.data.lesson)
    if (this.data.lesson.lessonType === 'In Person') {
      this.fetchLessonLocation(this.data.lesson.tuitionId);
    } else if (this.data.address?.latitude && this.data.address?.longitude) {
      this.setMapCoordinates(this.data.address.latitude, this.data.address.longitude);
    }
  }

  /** Fetch lesson tutor's address if lesson type is in-person */
  private fetchLessonLocation(tuitionId: number): void {
    this.addressService.getLessonTutorLocation(tuitionId).subscribe(
      (address) => {
        if (address?.latitude && address?.longitude) {
          this.setMapCoordinates(address.latitude, address.longitude);
        }
      },
      (error) => {console.error('Error fetching lesson location:', error);
      this.showAlert('Error retrieving lesson location. Refresh the page.');}
    );
  }


  private setMapCoordinates(latitude: number, longitude: number): void {
    this.latitude = latitude;
    this.longitude = longitude;
    this.showMap = true;
  }

  cancelLesson(): void {
    console.log('Cancelling Lesson ID:', this.data.lesson.id);
    this.availabilityService.cancelLessonById(this.data.lesson.id, this.resetAvailability).pipe(
      tap(() => {
        console.log(`Lesson cancelled. Reset availability: ${this.resetAvailability}`);
        this.dialogRef.close('cancelled');
      }),
      catchError(error => {
        console.error('Failed to cancel lesson:', error);
        return of(null); // Prevents observable from crashing the app
      })
    ).subscribe();
  }

  redirectToStudyHub(): void {
    console.log('Redirecting to Study Hub for Lesson ID:', this.data.lesson.id);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
  private showAlert(message: string): void {
    window.alert(message);
  }

  updateLessonStatus(lessonStatus : string, lessonId: number) {
      this.availabilityService.updateLessonStatus(lessonStatus,lessonId).pipe(
      tap(() => {
        console.log(`Lesson status updated`);
        this.dialogRef.close('updated');
        this.showAlert('Lesson successfully marked as completed')
      }),
      catchError(error => {
        console.error('Failed to cancel lesson:', error);
        this.showAlert('Unable to update lesson status, please try again.')
        return of(null); // Prevents observable from crashing the app
      })
    ).subscribe();
  }

  goToPayments(): void {
    this.router.navigate(['/user-dashboard/payments']);
    this.dialogRef.close();
  }
}
