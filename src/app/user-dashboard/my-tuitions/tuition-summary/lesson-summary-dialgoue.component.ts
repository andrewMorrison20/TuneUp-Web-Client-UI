import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {AddressDto, AddressService} from '../../update-profile/address/address-service.component';

import { Observable } from 'rxjs';

@Component({
  selector: 'app-lesson-summary-dialogue',
  templateUrl: './lesson-summary-dialogue.component.html',
})
export class LessonSummaryDialogComponent implements OnInit {
  googleMapUrl: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<LessonSummaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { lesson: any, address: AddressDto | null },
    private addressService: AddressService
  ) {}

  ngOnInit(): void {
    if (this.data.lesson.lessonType === 'In Person') {
      this.fetchLessonLocation(this.data.lesson.tuitionId).subscribe(
        (address) => {
          if (address?.latitude && address?.longitude) {
            this.data.address = address;
            this.setGoogleMapUrl(address.latitude, address.longitude);
          }
        },
        (error) => console.error('Error fetching lesson location:', error)
      );
    } else if (this.data.address?.latitude && this.data.address?.longitude) {
      this.setGoogleMapUrl(this.data.address.latitude, this.data.address.longitude);
    }
  }

  /** Fetch lesson tutor's address if lesson type is in-person */
  private fetchLessonLocation(tuitionId: number): Observable<AddressDto> {
    return this.addressService.getLessonTutorLocation(tuitionId);
  }

  /** Set Google Maps URL for embedding */
  private setGoogleMapUrl(latitude: number, longitude: number): void {
    if (latitude && longitude) {
      this.googleMapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${latitude},${longitude}`;
    }
  }

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
