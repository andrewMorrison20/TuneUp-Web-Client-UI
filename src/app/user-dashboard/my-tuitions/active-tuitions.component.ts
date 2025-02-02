import {Component, OnInit} from '@angular/core';
import {AvailabilityService} from "../../lessons/availability.service";
import {MatDialog} from "@angular/material/dialog";
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";
import {PageEvent} from "@angular/material/paginator";
import {ProfileLessonRequestsDialogComponent} from "./profile-lesson-requests-dialgoue.component";
import {TutorProfile} from "../../profiles/interfaces/tutor.model";
import {StudentProfile} from "../../profiles/interfaces/student.model";
type Profile = TutorProfile | StudentProfile;
@Component({
  selector: 'app-active-tuitions',
  templateUrl: './active-tuitions.component.html',
  styleUrl: './active-tuitions.component.scss'
})
export class ActiveTuitionsComponent implements OnInit {
  profiles: Profile[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  isLoading = true;

  constructor(private availabilityService: AvailabilityService,private dialog: MatDialog) {}

  ngOnInit() {
    this.fetchActiveTuitions();
  }

  fetchActiveTuitions() {

    this.isLoading=true;
    const profileId = AuthenticatedUser.getAuthUserProfileId();
    this.availabilityService.fetchActiveTuitions(profileId, this.pageIndex, this.pageSize)
      .subscribe(response => {
        this.profiles = response.content;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      }, error => {
        console.error('Error fetching profiles:', error);
        this.isLoading = false;
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchActiveTuitions();
  }

  openLessonRequestsDialog(profileId: number) {
    const dialogRef = this.dialog.open(ProfileLessonRequestsDialogComponent, {
      data: { profileId }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.fetchActiveTuitions();
    });
  }
}

