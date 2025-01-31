import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AvailabilityService } from '../../lessons/availability.service';
import { PageEvent } from '@angular/material/paginator';
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";

@Component({
  selector: 'app-lesson-requests-dialog',
  templateUrl: './profile-lesson-requests-dialogue.component.html',
  //styleUrls: ['./lesson-requests-dialog.component.scss']
})
export class ProfileLessonRequestsDialogComponent implements OnInit {
  lessonRequests: any[] = [];
  totalElements = 0;
  pageSize = 5;
  pageIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<ProfileLessonRequestsDialogComponent>,
    private availabilityService: AvailabilityService,
    @Inject(MAT_DIALOG_DATA) public data: { profileId: number }
  ) {}

  ngOnInit() {
    this.fetchLessonRequests();
  }

  fetchLessonRequests() {
    this.availabilityService.getLessonRequestsByIds(this.data.profileId, AuthenticatedUser.getAuthUserProfileId(), this.pageIndex, this.pageSize)
      .subscribe(response => {
        this.lessonRequests = response.content;
        this.totalElements = response.totalElements;
      }, error => {
        console.error('Error fetching lesson requests:', error);
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchLessonRequests();
  }

  confirmRequest(requestId: number) {
    console.log(`Confirming request: ${requestId}`);
    // Call API to confirm request here
  }

  denyRequest(requestId: number) {
    console.log(`Denying request: ${requestId}`);
    // Call API to deny request here
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
