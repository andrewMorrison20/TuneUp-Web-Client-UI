import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AvailabilityService } from "../../lessons/availability.service";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { CalendarOptions } from "@fullcalendar/core";
import { FullCalendarComponent } from "@fullcalendar/angular";
import { MatDialog } from "@angular/material/dialog";
import { LessonSummary } from "../my-tuitions/tuition-summary/lesson-summary.model";
import { LessonSummaryDialogComponent } from "../my-tuitions/tuition-summary/lesson-summary-dialgoue.component";
import { AuthenticatedUser } from "../../authentication/authenticated-user.class";

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
})
export class ScheduleComponent implements OnInit {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  calendarOptions!: CalendarOptions;
  availabilitySlots: any[] = [];
  isTimeGridView = false;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private availabilityService: AvailabilityService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.fetchAllLessons(new Date());
  }

  fetchAllLessons(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

    this.availabilityService.getAllLessons(AuthenticatedUser.getAuthUserProfileId(), start, end)
      .subscribe(response => {
        this.availabilitySlots = response;
        this.updateCalendarEvents();
        this.loading = false;
      });

    this.initializeCalendar();
    this.updateCalendarEvents();
  }

  private initializeCalendar(): void {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      selectable: true,
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

  private updateCalendarEvents(): void {
    this.calendarOptions.events = this.availabilitySlots.map((lesson: LessonSummary) => ({
      title: lesson.lessonStatus,
      start: lesson.availabilityDto.startTime,
      end: lesson.availabilityDto.endTime,
      extendedProps: { lesson },
      color: this.getEventColor(lesson.lessonStatus)
    }));

    this.calendarOptions.eventClick = this.onLessonClick.bind(this);
  }

  onDateClick(info: any): void {
    if (this.calendarComponent?.getApi()) {
      this.calendarComponent.getApi().changeView('timeGridDay', info.dateStr);
      this.isTimeGridView = true;
    }
  }

  switchToMonthView(): void {
    if (this.calendarComponent?.getApi()) {
      this.calendarComponent.getApi().changeView('dayGridMonth');
      this.isTimeGridView = false;
    }
  }

  onMonthChange(info: any): void {
    const newDate = info.start;
    this.fetchAllLessons(newDate);
  }

  private getEventColor(lessonStatus: string): string {
    switch (lessonStatus.toUpperCase()) {
      case 'CONFIRMED': return '#4CAF50';
      case 'COMPLETED': return '#9E9E9E';
      case 'CANCELLED': return '#FF0000';
      default: return '#000000';
    }
  }

  onLessonClick(info: any): void {
    const lesson: LessonSummary = info.event.extendedProps.lesson;
    const dialogRef = this.dialog.open(LessonSummaryDialogComponent, {
      data: { lesson }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'cancelled') {
        this.fetchAllLessons(new Date());
      }
    });
  }
}
