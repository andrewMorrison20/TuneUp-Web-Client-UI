import {Component, OnInit} from '@angular/core';
import {AvailabilityService} from "../../../lessons/availability.service";
import {MatDialog} from "@angular/material/dialog";
import {AuthenticatedUser} from "../../../authentication/authenticated-user.class";
import {PageEvent} from "@angular/material/paginator";
import {StudentProfile} from "../../../profiles/interfaces/student.model";
import {TutorProfile} from "../../../profiles/interfaces/tutor.model";
import {Router} from "@angular/router";
import {tap} from "rxjs/operators";
import {catchError, of} from "rxjs";
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

  constructor(private availabilityService: AvailabilityService,private dialog: MatDialog, private router :Router) {}

  ngOnInit() {
    this.fetchInActiveTuitions();
  }

  fetchInActiveTuitions(): void {
    this.isLoading = true;
    const profileId = AuthenticatedUser.getAuthUserProfileId();

    this.availabilityService.fetchTuitions(profileId, false, this.pageIndex, this.pageSize)
      .pipe(
        tap(response => {
          this.profiles = response.content;
          this.totalElements = response.totalElements;
          this.isLoading = false;
        }),
        catchError(error => {
          console.error('Error fetching profiles:', error);
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchInActiveTuitions();
  }

  viewTuitionSummary(profileId: number) {
    this.router.navigate(['/user-dashboard/tuition-summary', profileId]);
  }
}
