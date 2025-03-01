import {Component, OnInit} from '@angular/core';
import {AvailabilityService} from "../../../lessons/availability.service";
import {MatDialog} from "@angular/material/dialog";
import {AuthenticatedUser} from "../../../authentication/authenticated-user.class";
import {PageEvent} from "@angular/material/paginator";
import {TutorProfile} from "../../../profiles/interfaces/tutor.model";
import {StudentProfile} from "../../../profiles/interfaces/student.model";
import {Router} from "@angular/router";
import {TuitionsService} from "../tuitions.service";
import {tap} from "rxjs/operators";
import {catchError, EMPTY} from "rxjs";
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

  constructor(private availabilityService: AvailabilityService,private tuitionsService: TuitionsService,private dialog: MatDialog, private router :Router) {}

  ngOnInit() {
    this.fetchActiveTuitions();
  }

  fetchActiveTuitions() {
    this.isLoading = true;
    const profileId = AuthenticatedUser.getAuthUserProfileId();
    this.tuitionsService.fetchTuitions(profileId, true, this.pageIndex, this.pageSize)
      .pipe(
        tap(response => {
          this.profiles = response.content;
          this.totalElements = response.totalElements;
          this.isLoading = false;
        }),
        catchError(error => {
          console.error('Error fetching profiles:', error);
          this.isLoading = false;
          return EMPTY;
        })
      )
      .subscribe();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchActiveTuitions();
  }

  viewTuitionSummary(profileId: number) {
    this.router.navigate(['/user-dashboard/tuition-summary', profileId]);
  }

}

