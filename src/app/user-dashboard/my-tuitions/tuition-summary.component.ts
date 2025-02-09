import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AvailabilityService} from "../../lessons/availability.service";
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {CalendarOptions} from "@fullcalendar/core";
import {FullCalendarComponent} from "@fullcalendar/angular";
import {ProfileService} from "../../profiles/profile.service";
import {TutorProfile} from "../../profiles/interfaces/tutor.model";
import {StudentProfile} from "../../profiles/interfaces/student.model";
import {Observable} from "rxjs";


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


  tuitionDetails = {
    startDate: "2024-02-01",
    nextLessonDate: "2024-02-05"
  };
  // @ts-ignore
  constructor(private route: ActivatedRoute, private availabilityService: AvailabilityService, private profileService: ProfileService, private router: Router) {}

  ngOnInit() {
    this.profileId = Number(this.route.snapshot.paramMap.get('id')); // ✅ Get profile ID from URL
    this.fetchTuitionSummary();
    this.initializeCalendar();
    this.fetchProfiles();
  }

  //this needs generalised for both profile types i.e args need switch
  fetchTuitionSummary() {
    this.availabilityService.getTuitionSummary(this.profileId,AuthenticatedUser.getAuthUserProfileId()).subscribe(response => {
      this.tuitionSummary = response;
    });
  }

  private initializeCalendar(): void {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      selectable: true,
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      height: 'auto',
      contentHeight: 600,
      slotMinTime: "06:00:00", // Start time of the day (Adjust based on business hours)
      slotMaxTime: "23:00:00", // End time
      slotDuration: "00:15:00", // Smaller slots allow finer adjustments
      expandRows: true, // Ensures row height expands for long slots
      events: [],
      eventClick: this.onEventClick.bind(this),
      dateClick: this.onDateClick.bind(this),
      datesSet: this.onMonthChange.bind(this),
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        meridiem: false
      }
    }
  }

  /*private fetchAvailability(date: Date): void {
    if (!this.profile?.id) return;
    const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

    this.profileService.getPeriodAvailabilityForProfile(this.profile.id, start, end)
      .subscribe(slots => {
        this.availabilitySlots = slots;
        this.updateCalendarEvents();
      });
  }

  onMonthChange(info: any): void {
    const newDate = info.start;
    this.fetchAvailability(newDate);
  }*/

  /** 🔹 Switch to TimeGrid Day View */
  onDateClick(info: any): void {
    console.log('Clicked date:', info.dateStr);
    if (this.calendarComponent?.getApi()) {
      this.calendarComponent.getApi().changeView('timeGridDay', info.dateStr);
      this.isTimeGridView = true;
    }
  }

  /** 🔹 Switch Back to Month View */
  switchToMonthView(): void {
    console.log('Switching back to Month View...');
    if (this.calendarComponent?.getApi()) {
      this.calendarComponent.getApi().changeView('dayGridMonth');
      this.isTimeGridView = false;
    }
  }

  /** 🔹 Handle Event Click */
  onEventClick(info: any): void {
    console.log('Event clicked:', info.event.title);

    const availabilityId = info.event.extendedProps.availabilityId;

    if (!availabilityId) {
      console.error("No availability ID found!");
      return;
    }
    /*const dialogRef = this.dialog.open(LessonRequestDialogComponent, {
      width: '400px',
      data: {
        title: info.event.title,
        startTime: info.event.start.toISOString(),
        endTime: info.event.end?.toISOString(),
        profileId: this.profile?.id,
        availabilityId:availabilityId,
        status: info.event.title,
        instruments :this.profile?.instruments,
      }
    });*/

    // Handle dialog result
   // dialogRef.afterClosed().subscribe(result => {
      //if (result=== true) {
       // this.fetchAvailability(this.calendarComponent.getApi().getDate());
    //  }
  //  });
 }

  onMonthChange(info: any): void {
    const newDate = info.start;
    //this.fetchAvailability(newDate);
  }

  goBackToTuitions() {
    this.router.navigate(['/user-dashboard/my-tuitions'], { queryParams: { tab: 1 } });
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

}
