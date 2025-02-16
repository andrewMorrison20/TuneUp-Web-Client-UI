import {Component, OnInit} from '@angular/core';
import {AvailabilityService} from "../../../lessons/availability.service";
import {AuthenticatedUser} from "../../../authentication/authenticated-user.class";
import {PageEvent} from "@angular/material/paginator";
import {TutorProfile} from "../../../profiles/interfaces/tutor.model";
import {StudentProfile} from "../../../profiles/interfaces/student.model";
import {MatDialog} from "@angular/material/dialog";
import {ProfileLessonRequestsDialogComponent} from "../profile-lesson-requests-dialgoue.component";
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
  isLoading = true;

  constructor(private availabilityService: AvailabilityService,private dialog: MatDialog) {}

  ngOnInit() {
    this.fetchLessonRequestProfiles();
  }

  fetchLessonRequestProfiles() {
    this.isLoading=true;
    const userProfileId = AuthenticatedUser.getAuthUserProfileId();
    this.availabilityService.fetchRequestProfiles(userProfileId, this.pageIndex, this.pageSize)
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
    this.fetchLessonRequestProfiles();
  }

  openLessonRequestsDialog(profileId: number, profileType: string) {
    const dialogRef = this.dialog.open(ProfileLessonRequestsDialogComponent, {
      data: { profileId,profileType }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.fetchLessonRequestProfiles();
    });
  }
}
