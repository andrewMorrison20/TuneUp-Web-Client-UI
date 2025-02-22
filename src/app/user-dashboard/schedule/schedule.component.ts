import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AvailabilityService } from "../../lessons/availability.service";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { CalendarOptions, DateSelectArg } from "@fullcalendar/core";
import { FullCalendarComponent } from "@fullcalendar/angular";
import { MatDialog } from "@angular/material/dialog";
import { LessonSummary } from "../my-tuitions/tuition-summary/lesson-summary/lesson-summary.model";
import { LessonSummaryDialogComponent } from "../my-tuitions/tuition-summary/lesson-summary/lesson-summary-dialgoue.component";
import { AuthenticatedUser } from "../../authentication/authenticated-user.class";
import {ScheduleAdjustmentDialogComponent} from "./schedule-adjustment-dialogue.component";

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrl:'./schedule.component.scss'
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
      select: this.onMultiSlotSelect.bind(this), // 💡 Added multi-slot select
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        meridiem: false
      }
    };
  }

  private onMultiSlotSelect(selectInfo: DateSelectArg): void {
    const isOverlap = this.availabilitySlots.some(slot =>
      (new Date(selectInfo.start).getTime() < new Date(slot.availabilityDto.endTime).getTime()) &&
      (new Date(selectInfo.end).getTime() > new Date(slot.availabilityDto.startTime).getTime())
    );

    if (isOverlap) {
      alert('⚠️ Selected slot overlaps with existing availability.');
      this.calendarComponent.getApi().unselect();
    } else {
      this.openAvailabilityDialog(selectInfo.startStr, selectInfo.endStr, false);
    }
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

  private openAvailabilityDialog(startTime: string, endTime: string, isEditMode: boolean, availabilityId?: number): void {
    const dialogRef = this.dialog.open(ScheduleAdjustmentDialogComponent, {
      width: '400px',
      data: { startTime, endTime, isEditMode }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'create') {
        this.availabilityService.createAvailability(
          AuthenticatedUser.getAuthUserProfileId(),
          result.startTime,
          result.endTime
        ).subscribe(() => this.fetchAllLessons(new Date(result.startTime)));
      } else if (result?.action === 'update' && availabilityId) {
       // this.availabilityService.updateAvailability(
      //    availabilityId, result.startTime, result.endTime
      //  ).subscribe(() => this.fetchAllLessons(new Date(result.startTime)));
    //  } else if (result?.action === 'delete' && availabilityId) {
      //  this.availabilityService.deleteAvailability(availabilityId)
      //    .subscribe(() => this.fetchAllLessons(new Date(result.startTime)));
      }
    })
  }

  private onAvailabilityClick(info: any): void {
    const availability = info.event;
    this.openAvailabilityDialog(
      availability.startStr,
      availability.endStr,
      true,
      availability.id
    );
  }

  blockBookData = {
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    allDay: false,
    repeatWeekly: false,
    repeatUntil: ''
  };

  onBlockBookSubmit(): void {
    if (!this.blockBookData.startDate || !this.blockBookData.endDate) return;

    const startBase = this.blockBookData.startDate;
    const endBase = this.blockBookData.endDate;
    const startTime = this.blockBookData.allDay ? '00:00' : this.blockBookData.startTime;
    const endTime = this.blockBookData.allDay ? '23:59' : this.blockBookData.endTime;

    let datesToBlock: { start: string; end: string }[] = [];

    let currentDate = new Date(startBase);
    const endDate = new Date(endBase);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      datesToBlock.push({
        start: `${dateStr}T${startTime}`,
        end: `${dateStr}T${endTime}`
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (this.blockBookData.repeatWeekly && this.blockBookData.repeatUntil) {
      const repeatEnd = new Date(this.blockBookData.repeatUntil);
      const additionalWeeks: { start: string; end: string }[] = [];
      datesToBlock.forEach((slot) => {
        let repeatDate = new Date(slot.start);
        while (repeatDate <= repeatEnd) {
          repeatDate.setDate(repeatDate.getDate() + 7);
          const repeatStr = repeatDate.toISOString().split('T')[0];
          additionalWeeks.push({
            start: `${repeatStr}T${startTime}`,
            end: `${repeatStr}T${endTime}`
          });
        }
      });
      datesToBlock = [...datesToBlock, ...additionalWeeks];
    }

    datesToBlock.forEach((slot) => {
      this.availabilityService.createAvailability(
        AuthenticatedUser.getAuthUserProfileId(),
        slot.start,
        slot.end
      ).subscribe({
        next: () => this.fetchAllLessons(new Date(slot.start)),
        error: (err) => console.error('Failed to block book availability:', err)
      });
    });
  }

}
