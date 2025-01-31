import {Component, OnInit} from '@angular/core';
import {AvailabilityService} from "../../lessons/availability.service";
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";
import {PageEvent} from "@angular/material/paginator";
import {TutorProfile} from "../../profiles/interfaces/tutor.model";
import {StudentProfile} from "../../profiles/interfaces/student.model";
import {MatDialog} from "@angular/material/dialog";
import {ProfileLessonRequestsDialogComponent} from "./profile-lesson-requests-dialgoue.component";
type Profile = TutorProfile | StudentProfile;

@Component({
  selector: 'app-lesson-requests',
  templateUrl: './lesson-requests.component.html',
  styleUrls: ['./lesson-requests.component.scss']
})
export class LessonRequestsComponent implements OnInit {
  profiles: Profile[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(private availabilityService: AvailabilityService,private dialog: MatDialog) {}

  ngOnInit() {
    this.fetchLessonRequestProfiles();
  }

  fetchLessonRequestProfiles() {
    const tutorId = AuthenticatedUser.getAuthUserProfileId();
    this.availabilityService.fetchRequestProfiles(tutorId, this.pageIndex, this.pageSize)
      .subscribe(response => {
        this.profiles = response.content;
        this.totalElements = response.totalElements;
      }, error => {
        console.error('Error fetching profiles:', error);
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchLessonRequestProfiles();
  }

    openLessonRequestsDialog(profileId: number) {
      this.dialog.open(ProfileLessonRequestsDialogComponent, {
        width: '500px',
        data: { profileId }
      });
  }
}
