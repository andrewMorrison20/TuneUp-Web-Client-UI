import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AvailabilityService} from "../../../lessons/availability.service";
import {AuthenticatedUser} from "../../../authentication/authenticated-user.class";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {CalendarOptions} from "@fullcalendar/core";
import {FullCalendarComponent} from "@fullcalendar/angular";
import {ProfileService} from "../../../profiles/profile.service";
import {TutorProfile} from "../../../profiles/interfaces/tutor.model";
import {StudentProfile} from "../../../profiles/interfaces/student.model";
import {MatDialog} from "@angular/material/dialog";
import {LessonSummaryDialogComponent} from "./lesson-summary/lesson-summary-dialgoue.component";
import {LessonSummary} from "./lesson-summary/lesson-summary.model";
import { TuitionsService } from '../tuitions.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {ReviewDialogueComponent} from "../reviews/review-dialogue.component";
import {ChatDialogueComponent} from "../../chats/chat-dialogue.component";
import {forkJoin} from "rxjs";



@Component({
  selector: 'app-tuition-summary',
  templateUrl: './tuition-summary.component.html',
  styleUrls: ['./tuition-summary.component.scss']
})
export class TuitionSummaryComponent implements OnInit {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  calendarOptions!: CalendarOptions;
  availabilitySlots: any[] = []
  isTimeGridView = false;
  profileId!: number;
  tuitionSummary: any;

  userProfile!: TutorProfile | StudentProfile;
  profile!: TutorProfile | StudentProfile;
  loading: boolean = true;

  tuitionDetails = {
    startDate: null,
  };


  constructor(private route: ActivatedRoute,
              private availabilityService: AvailabilityService,
              private profileService: ProfileService,
              private router: Router,
              private dialog: MatDialog,
              private tuitionsService: TuitionsService,
              private snackBar: MatSnackBar
  ) {
  }


ngOnInit(): void {
  this.profileId = Number(this.route.snapshot.paramMap.get('id'));

  const tuitionSummary$ = this.availabilityService.getTuitionSummary(
    this.profileId,
    AuthenticatedUser.getAuthUserProfileId()
  );
  const userProfile$ = this.profileService.getProfileById(
    AuthenticatedUser.getAuthUserProfileId()
  );
  const tuitionProfile$ = this.profileService.getProfileById(this.profileId);

  forkJoin([tuitionSummary$, userProfile$, tuitionProfile$])
  .subscribe({
    next: ([tuitionSummary, userProfile, tuitionProfile]) => {

      this.tuitionSummary = tuitionSummary;
      this.userProfile = userProfile;
      this.profile = tuitionProfile;


      this.fetchLessons(new Date());
      this.initializeCalendar();
      this.updateCalendarEvents();
      this.loading = false;
    },
    error: (err) => {

      console.error('Failed to load all required data', err);

    }
  });
}


  private initializeCalendar(): void {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      selectable: true,
      selectMirror: true,
      selectOverlap: false,
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      height: 'auto',
      contentHeight: 600,
      slotMinTime: "06:00:00",
      slotMaxTime: "23:00:00",
      slotDuration: "00:15:00",
      expandRows: true,
      events: [],
      dateClick: this.onDateClick.bind(this),
      datesSet: this.onMonthChange.bind(this),
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        meridiem: false
      }
    };
  }

  fetchTuitionSummary() {
    this.availabilityService.getTuitionSummary(this.profileId, AuthenticatedUser.getAuthUserProfileId()).subscribe(response => {
      this.tuitionSummary = response;
      this.tuitionDetails.startDate = this.tuitionSummary.startDate;
      this.fetchLessons(new Date());
    });

    console.log('TUITION SUMMARY' ,this.tuitionSummary)
  }

  private fetchLessons(date: Date): void {
    console.log('in here')
    if (!this.profile?.id) return;
    const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    const end = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}T23:59:59.999`;
    console.log('Fetching lessons for cal')
    this.availabilityService.getTuitionLessonSummary(this.tuitionSummary.id, start, end)
      .subscribe(response => {
        this.availabilitySlots = response.map((lesson: LessonSummary) => lesson);
        this.updateCalendarEvents();
      });
  }


  private updateCalendarEvents(): void {
    if(!this.availabilitySlots){
      return
    }
    this.calendarOptions.events = this.availabilitySlots.map((lesson: LessonSummary) => ({
      title: lesson.lessonStatus,
      start: lesson.availabilityDto.startTime,
      end: lesson.availabilityDto.endTime,
      extendedProps: {lesson},
      color: this.getEventColor(lesson.lessonStatus)
    }));

    this.calendarOptions.eventClick = this.onLessonClick.bind(this);
  }


  onLessonClick(info: any): void {
    const lesson: LessonSummary = info.event.extendedProps.lesson;


    const dialogRef = this.dialog.open(LessonSummaryDialogComponent, {
      height: '700px',
      data: {lesson}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'cancelled') {
        this.fetchLessons(new Date());
      }
    });
  }

  private getEventColor(lessonStatus: string): string {
    switch (lessonStatus.toUpperCase()) {
      case 'CONFIRMED':
        return '#4CAF50';
      case 'COMPLETED':
        return '#9E9E9E';
      case 'CANCELLED':
        return '#FF0000';
      default:
        return '#000000';
    }
  }


  onDateClick(info: any): void {
    console.log('Clicked date:', info.dateStr);
    if (this.calendarComponent?.getApi()) {
      this.calendarComponent.getApi().changeView('timeGridDay', info.dateStr);
      this.isTimeGridView = true;
    }
  }


  switchToMonthView(): void {
    console.log('Switching back to Month View...');
    if (this.calendarComponent?.getApi()) {
      this.calendarComponent.getApi().changeView('dayGridMonth');
      this.isTimeGridView = false;
    }
  }

  private onMonthChange(info: any): void {
    if (!this.calendarComponent || !this.calendarComponent.getApi) {
      console.warn(' calendarComponent not initialized yet.');
      return;
    }
    console.log('TUITION SUMMARY' ,this.tuitionSummary)
    const currentDate = this.calendarComponent.getApi().getDate();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0).toISOString();

    console.log(` Fetching for month: ${start} to ${end}`);
    this.fetchLessons(new Date(start));
  }

  goBackToTuitions() {
    this.router.navigate(['/user-dashboard/my-tuitions'], {queryParams: {tab: 1}});
  }


  fetchProfiles() {
    this.profileService.getProfileById(AuthenticatedUser.getAuthUserProfileId()).subscribe(profile => {
      console.log('Current user Profile:', profile);
      this.userProfile = profile;
    });

    this.profileService.getProfileById(this.profileId).subscribe(profile => {
      console.log('Tuition Profile:', profile);
      this.profile = profile;
    });
  }

  deactivateTuition(): void {
    const confirmed = window.confirm('Are you sure you want to deactivate this tuition?');

    if (!confirmed) {
      return;
    }

    this.tuitionsService.deactivateTuition(this.tuitionSummary.id).subscribe({
      next: () => {
        this.snackBar.open('Tuition successfully deactivated.', 'OK', {duration: 3000});
      },
      error: (err) => {
        console.error('Failed to deactivate tuition:', err);
        this.snackBar.open('Error deactivating tuition. Please try again.', 'Close', {duration: 4000});
      }
    });
  }

  leaveReview(tutorName: string): void {
    const dialogRef = this.dialog.open(ReviewDialogueComponent, {
      width: '600px',
      data: {tutorName}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Review Submitted:', result);

        this.submitReview(result);
      }
    });
  }

  submitReview(reviewData: { rating: number, title: string, content: string }): void {
    console.log('Sending review to server:', reviewData);

    const reviewDto = {
      profileId: this.profile.id,
      title: reviewData.title,
      comment: reviewData.content,
      rating: reviewData.rating,
      tuitionId: this.tuitionSummary.id,
      reviewerProfileId: AuthenticatedUser.getAuthUserProfileId(),
      reviewerName: this.userProfile.displayName
    };

    this.profileService.createReview(reviewDto).subscribe({
      next: () => {
        alert('Review submitted successfully!');
      },
      error: (err) => {
        console.error('Failed to submit review:', err);
        alert('Error submitting review. Please try again.');
      }
    });
  }

}
