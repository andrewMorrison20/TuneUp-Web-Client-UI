import {Component, OnInit, ViewChild, AfterViewInit, HostListener} from '@angular/core';
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
import {ChatDialogueComponent} from "../user-dashboard/chats/chat-dialogue.component";
import { ViewApi } from '@fullcalendar/core';

type Profile = TutorProfile | StudentProfile;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  profile: Profile | null = null;
  calendarOptions!: CalendarOptions;
  availabilitySlots: any[] = [];
  isOwnProfile = false;

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
        this.isOwnProfile = AuthenticatedUser.getAuthUserProfileId() === +profileId;
        this.fetchProfile(+profileId);
      }
    });
  }

  private initializeCalendar(): void {
    const initial = window.innerWidth < 768 ? 'timeGridDay' : 'dayGridMonth';
    this.calendarOptions = {
      initialView: initial,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      buttonText: {
        prev: 'Previous',
        next: 'Next',
        today: 'Today'
      },
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      height: 'auto',
      contentHeight: 600,
      slotMinTime: '06:00:00',
      slotMaxTime: '23:00:00',
      slotDuration: '00:30:00',
      expandRows: true,
      events: [],
      eventClick: this.onEventClick.bind(this),
      dateClick: this.onDateClick.bind(this),
      datesSet: this.onMonthChange.bind(this),
      windowResize: ({ view }) => {
        const viewName = window.innerWidth < 768 ? 'timeGridDay' : 'dayGridMonth';
        (view as ViewApi).calendar.changeView(viewName);
      },
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      },
      locale: 'en-GB',
      displayEventEnd: true,
      eventDidMount: info => {
        const status = info.event.extendedProps['status'];
        const timeEl = info.el.querySelector('.fc-event-time');
        if (timeEl instanceof HTMLElement) {
          timeEl.style.color = status === 'BOOKED' ? 'grey' : 'inherit';
        }
      }
    };
  }

  private fetchProfile(profileId: number): void {
    this.profileService.getProfileById(profileId).subscribe({
      next: profile => {
        this.profile = profile;
        this.profileService.getProfileReviews(profile.id).subscribe({
          next: reviews => (this.profile!.reviews = reviews),
          error: err => console.error('Error fetching reviews:', err)
        });
        this.fetchProfileQualifications();
        this.fetchAvailability(new Date());
      },
      error: err => console.error('Error fetching profile:', err)
    });
  }

  private fetchAvailability(date: Date): void {
    if (!this.profile?.id) return;
    const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    const end = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}T23:59:59.999`;

    this.availabilityService.getPeriodAvailabilityForProfile(this.profile.id, start, end)
      .subscribe(slots => {
        this.availabilitySlots = slots;
        this.updateCalendarEvents();
      });
  }

  private onMonthChange(info: any): void {
    if (!this.calendarComponent || !this.calendarComponent.getApi) {
      console.warn(' calendarComponent not initialized yet.');
      return;
    }

    const currentDate = this.calendarComponent.getApi().getDate();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0).toISOString();

    console.log(`Fetching for month: ${start} to ${end}`);
    this.fetchAvailability(new Date(start));
  }

  onDateClick(info: any): void {
    this.calendarComponent.getApi()?.changeView('timeGridDay', info.dateStr);
  }

  onEventClick(info: any): void {
    const availabilityId = info.event.extendedProps.availabilityId;
    if (!availabilityId || this.profile?.profileType !== 'Tutor') return;
    const dialogRef = this.dialog.open(LessonRequestDialogComponent, {
      width: '400px',
      data: {
        title: info.event.title,
        startTime: info.event.start.toISOString(),
        endTime: info.event.end?.toISOString(),
        profileId: this.profile.id,
        availabilityId,
        status: info.event.title,
        instruments: this.profile.instruments,
        lessonType: this.profile.lessonType
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchAvailability(this.calendarComponent.getApi().getDate());
    });
  }

  isTutorProfile(profile: Profile): profile is TutorProfile {
    return profile.profileType === 'Tutor';
  }

  isPricesMapNotEmpty(): boolean {
    return this.isTutorProfile(this.profile!) && (this.profile as TutorProfile).prices.length > 0;
  }


  goBackToResults(): void {
    this.router.navigate(['/profiles/search']);
  }

  startChat(): void {
    console.log('Starting chat with', this.profile?.displayName);
    this.openChatDialog();
  }

  private updateCalendarEvents(): void {
    this.calendarOptions.events = this.availabilitySlots.map(slot => ({
      title: '',
      start: slot.startTime,
      end: slot.endTime,
      extendedProps: { availabilityId: slot.id, status: slot.status },
      color: this.getEventColor(slot.status)
    }));
  }

  private getEventColor(status: string): string {
    switch (status) {
      case 'AVAILABLE': return '#4CAF50';
      case 'PENDING':   return '#9E9E9E';
      case 'BOOKED':    return '#FF0000';
      default:          return '#000000';
    }
  }

  openChatDialog(): void {
    const dialogRef = this.dialog.open(ChatDialogueComponent, {
      width: '800px',
      data: {
        conversation: null,
        participantId: this.profile?.id,
        userProfileId: AuthenticatedUser.getAuthUserProfileId()
      }
    });
    dialogRef.afterClosed().subscribe();
  }

  private fetchProfileQualifications(): void {
    if (!this.profile) return;
    this.profileService.getProfileQualificationsById(this.profile.id)
      .subscribe({ next: quals => (this.profile!.instrumentQuals = quals), error: err => console.error(err) });
  }
}

