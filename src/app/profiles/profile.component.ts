import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from './profile.service';
import { TutorProfile } from './interfaces/tutor.model';
import { StudentProfile } from './interfaces/student.model';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { FullCalendarComponent } from '@fullcalendar/angular';
import {MatDialog} from "@angular/material/dialog";
import {LessonRequestDialogComponent} from "../lessons/lesson-request/lesson-request-dialog.component";
import {AuthenticatedUser} from "../authentication/authenticated-user.class";
import {AvailabilityService} from "../lessons/availability.service";

type Profile = TutorProfile | StudentProfile;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, AfterViewInit {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  profile: Profile | null = null;
  isTimeGridView = false;
  calendarOptions!: CalendarOptions;
  availabilitySlots: any[] = []

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileService: ProfileService,
    private availabilityService: AvailabilityService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeCalendar();
    this.route.paramMap.subscribe(params => {
      const profileId = params.get('id');
      if (profileId) {
        this.fetchProfile(Number(profileId));
        this.fetchProfileQualifications();
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.calendarComponent) {
      console.error('FullCalendar reference not found.');
    }
  }

  /** 🔹 Initialize FullCalendar Configuration */
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
    };
  }

  /** 🔹 Fetch Profile Details */
  private fetchProfile(profileId: number): void {
    this.profileService.getProfileById(profileId).subscribe(
      profile => {
        this.profile = profile;
        console.log('Profile loaded:', profile);
        this.profileService.getProfileReviews(this.profile);
        this.fetchAvailability(new Date());
      },
      error => console.error('Error fetching profile:', error)
    );
  }

  private fetchAvailability(date: Date): void {
    if (!this.profile?.id) return;
    const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

    this.availabilityService.getPeriodAvailabilityForProfile(this.profile.id, start, end)
      .subscribe(slots => {
        this.availabilitySlots = slots;
        this.updateCalendarEvents();
      });
  }

  onMonthChange(info: any): void {
    const newDate = info.start;
    this.fetchAvailability(newDate);
  }
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
    const dialogRef = this.dialog.open(LessonRequestDialogComponent, {
      width: '400px',
      data: {
        title: info.event.title,
        startTime: info.event.start.toISOString(),
        endTime: info.event.end?.toISOString(),
        profileId: this.profile?.id,
        availabilityId:availabilityId,
        status: info.event.title,
        instruments :this.profile?.instruments,
        lessonType: this.profile?.lessonType
      }
    });

    // Handle dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result=== true) {
        this.fetchAvailability(this.calendarComponent.getApi().getDate());
      }
    });
  }

  isTutorProfile(profile: Profile): profile is TutorProfile {
    return profile.profileType === 'Tutor';
  }

  /** 🔹 Check if Profile Has Pricing */
  isPricesMapNotEmpty(): boolean {
    return this.isTutorProfile(this.profile!) && (this.profile as TutorProfile).prices.length > 0;
  }


  /** 🔹 Navigation Methods */
  goBackToResults(): void {
    this.router.navigate(['/profiles/search']);
  }

  startChat(): void {
    console.log('Starting chat with', this.profile?.displayName);
  }

  private updateCalendarEvents(): void {
    this.calendarOptions.events = this.availabilitySlots.map(slot => ({
      title: slot.status,
      start: slot.startTime,
      end: slot.endTime,
      extendedProps: { availabilityId: slot.id },
      color: this.getEventColor(slot.status)
    }));
  }

  private getEventColor(status: string): string {
    switch (status) {
      case 'AVAILABLE': return '#4CAF50'; // Green
      case 'PENDING': return '#9E9E9E';   // Grey
      case 'BOOKED': return '#FF0000';    // Red
      default: return '#000000';          // Fallback Black
    }
  }

  private fetchProfileQualifications() {
    this.profileService.getProfileQualificationsById(AuthenticatedUser.getAuthUserProfileId())
      .subscribe();
  }
}
