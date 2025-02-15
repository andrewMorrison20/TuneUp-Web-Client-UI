import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddressDto, AddressService } from '../../update-profile/address/address-service.component';

@Component({
  selector: 'app-lesson-summary-dialogue',
  templateUrl: './lesson-summary-dialogue.component.html',
})
export class LessonSummaryDialogComponent implements OnInit {
  latitude!: number;
  longitude!: number;
  zoom: number = 15;
  showMap: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<LessonSummaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { lesson: any, address: AddressDto | null },
    private addressService: AddressService
  ) {}

  ngOnInit(): void {
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
      (error) => console.error('Error fetching lesson location:', error)
    );
  }


  private setMapCoordinates(latitude: number, longitude: number): void {
    this.latitude = latitude;
    this.longitude = longitude;
    this.showMap = true;
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
