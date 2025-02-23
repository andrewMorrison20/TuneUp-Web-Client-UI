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

  blockBookData = {
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    allDay: false,
    repeatWeekly: false,
    repeatUntil: ''
  };

  constructor(
    private route: ActivatedRoute,
    private availabilityService: AvailabilityService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.fetchAllAvailability(new Date());
    this.initializeCalendar();
    this.updateCalendarEvents();

  }

  fetchAllAvailability(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();
    console.log(start ,end + 'IN FETCH')
    this.availabilityService.getPeriodAvailabilityForProfile(AuthenticatedUser.getAuthUserProfileId(), start, end)
      .subscribe(response => {
        this.availabilitySlots = response;
        this.updateCalendarEvents();
        this.loading = false;
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
      select: this.onMultiSlotSelect.bind(this),
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        meridiem: false
      }
    };
  }

  private onMultiSlotSelect(selectInfo: DateSelectArg): void {
    const isOverlap = this.availabilitySlots.some(slot =>
      (new Date(selectInfo.start).getTime() < new Date(slot.endTime).getTime()) &&
      (new Date(selectInfo.end).getTime() > new Date(slot.startTime).getTime())
    );

    if (isOverlap) {
      alert('⚠️ Selected slot overlaps with existing availability.');
      this.calendarComponent.getApi().unselect();
    } else {
      this.openAvailabilityDialog(selectInfo.startStr, selectInfo.endStr, false);
    }
  }

  private updateCalendarEvents(): void {
    this.calendarOptions.events = this.availabilitySlots.map((slot: any) => ({
      title: slot.status,
      start: slot.startTime,
      id: slot.id,
      end: slot.endTime,
      extendedProps: { slot },
      color: this.getEventColor(slot.status)
    }));

    this.calendarOptions.eventClick = this.onAvailabilityClick.bind(this);
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

  //Full calendar is proving to be inconsistent, this should be switched out for mat calendar.
  //inconsistency in how info.start is generated, have raised this with angular support - known issue.
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

    console.log(`📅 Fetching for month: ${start} to ${end}`);
    this.fetchAllAvailability(new Date(start));
  }



  private getEventColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE': return '#4CAF50';
      case 'PENDING': return '#9E9E9E';
      case 'BOOKED': return '#FF0000';
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
        this.fetchAllAvailability(new Date());
      }
    });
  }

  private openAvailabilityDialog(startTime: string, endTime: string, isEditMode: boolean, availabilityId?: number): void {
    const dialogRef = this.dialog.open(ScheduleAdjustmentDialogComponent, {
      width: '400px',
      data: { startTime, endTime, isEditMode, availabilityId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'create') {
        this.availabilityService.createAvailability(
          AuthenticatedUser.getAuthUserProfileId(),
          result.startTime,
          result.endTime
        ).subscribe(() => this.fetchAllAvailability(new Date(result.startTime)));
      } else if (result?.action === 'update' && availabilityId) {
       this.availabilityService.updateAvailability(
          availabilityId, result.startTime, result.endTime
       ).subscribe(() => this.fetchAllAvailability(new Date(result.startTime)));
     } else if (result?.action === 'delete' && availabilityId) {
        this.availabilityService.deleteAvailability(availabilityId)
        .subscribe(() => this.fetchAllAvailability(new Date()));
      }
    })
    this.updateCalendarEvents();
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
        next: () => this.fetchAllAvailability(new Date(slot.start)),
        error: (err) => console.error('Failed to block book availability:', err)
      });
    });
  }

}
