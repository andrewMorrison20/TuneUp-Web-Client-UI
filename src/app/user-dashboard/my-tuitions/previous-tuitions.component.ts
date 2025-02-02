import {Component, OnInit} from '@angular/core';
import {AvailabilityService} from "../../lessons/availability.service";
import {MatDialog} from "@angular/material/dialog";
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";
import {PageEvent} from "@angular/material/paginator";
import {StudentProfile} from "../../profiles/interfaces/student.model";
import {TutorProfile} from "../../profiles/interfaces/tutor.model";
type Profile = TutorProfile | StudentProfile ;

@Component({
  selector: 'app-previous-tuitions',
  templateUrl: './previous-tuitions.component.html',
  styleUrl: './previous-tuitions.component.scss'
})
export class PreviousTuitionsComponent implements OnInit {
  profiles: Profile[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  isLoading = true;

  constructor(private availabilityService: AvailabilityService,private dialog: MatDialog) {}

  ngOnInit() {
    this.fetchInActiveTuitions();
  }

  fetchInActiveTuitions() {

    this.isLoading=true;
    const profileId = AuthenticatedUser.getAuthUserProfileId();
    this.availabilityService.fetchTuitions(profileId,false,this.pageIndex, this.pageSize)
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
    this.fetchInActiveTuitions();
  }
}
