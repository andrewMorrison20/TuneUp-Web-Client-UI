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
import { forkJoin } from 'rxjs';

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
    const availability = info.event.extendedProps.slot;

    this.availabilityService.fetchLessonSummaryByAvailabilityId(availability.id)
      .subscribe({
        next: (lessonSummaryFromApi: any) => {
          const combinedLessonSummary: LessonSummary = {
            ...lessonSummaryFromApi,
            availabilityDto: {
              id: availability.id,
              profileId: availability.profileId,
              startTime: availability.startTime,
              endTime: availability.endTime,
              status: availability.status
            }
          };

          const dialogRef = this.dialog.open(LessonSummaryDialogComponent, {
            data: { lesson: combinedLessonSummary, address: null }
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result === 'cancelled') {
              this.fetchAllAvailability(new Date());
            }
          });
        },
        error: (err) => {
          console.error('Failed to fetch lesson summary:', err);
          alert('Failed to load lesson details. Please try again later.');
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
    const availability = info.event.extendedProps.slot;

    if (availability.status === 'BOOKED') {
      this.onLessonClick(info);
    } else {
      this.openAvailabilityDialog(
        availability.startTime,
        availability.endTime,
        true,
        availability.id
      );
    }
  }




onBlockBookSubmit(): void {
  if (!this.isValidInput()) return;

const datesToBlock = this.generateDatesToBlock();

if (datesToBlock.length === 0) {
  alert('⚠️ No valid availability slots found.');
  return;
}

this.submitAvailabilitySlots(datesToBlock);
}

/**
 * ✅ Validates input before processing
 */
private isValidInput(): boolean {
  if (!this.blockBookData.startDate || !this.blockBookData.endDate) {
    alert('⚠️ Please select a valid start and end date.');
    return false;
  }

  const startDate = new Date(this.blockBookData.startDate);
  const endDate = new Date(this.blockBookData.endDate);

  if (startDate > endDate) {
    alert('⚠️ Start date cannot be after end date.');
    return false;
  }

  if (!this.blockBookData.allDay) {
    if (!this.blockBookData.startTime || !this.blockBookData.endTime) {
      alert('⚠️ Please select a start and end time.');
      return false;
    }
    if (this.blockBookData.startTime >= this.blockBookData.endTime) {
      alert('⚠️ Start time must be before end time.');
      return false;
    }
  }

  return true;
}

/**
 * ✅ Generates the list of dates to block
 */
private generateDatesToBlock(): { start: string; end: string, profileId:number }[] {
  const profileId = AuthenticatedUser.getAuthUserProfileId();
  const startBase = new Date(this.blockBookData.startDate);
  const endBase = new Date(this.blockBookData.endDate);
  const startTime = this.blockBookData.allDay ? '00:00' : this.blockBookData.startTime;
  const endTime = this.blockBookData.allDay ? '23:59' : this.blockBookData.endTime;

  let datesToBlock: { start: string; end: string, profileId:number }[] = [];

  let currentDate = new Date(startBase);
  while (currentDate <= endBase) {
    const dateStr = currentDate.toISOString().split('T')[0];
    datesToBlock.push({
      start: `${dateStr}T${startTime}`,
      end: `${dateStr}T${endTime}`,
      profileId
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (this.blockBookData.repeatWeekly && this.blockBookData.repeatUntil) {
    const repeatEnd = new Date(this.blockBookData.repeatUntil);
    let additionalWeeks: { start: string; end: string, profileId: number}[] = [];

    datesToBlock.forEach((slot) => {
      let repeatDate = new Date(slot.start);
      repeatDate.setDate(repeatDate.getDate() + 7);

      while (repeatDate <= repeatEnd) {
        const repeatStr = repeatDate.toISOString().split('T')[0];
        additionalWeeks.push({
          start: `${repeatStr}T${startTime}`,
          end: `${repeatStr}T${endTime}`,
          profileId
        });
        repeatDate.setDate(repeatDate.getDate() + 7);
      }
    });

    datesToBlock = [...datesToBlock, ...additionalWeeks];
  }

  return datesToBlock;
}

  /**
   * Batch create the availabilility slots to prevent inconsistent state / partial creates
   * @param datesToBlock the set of slots to create availability for
   * @private
   */
  private submitAvailabilitySlots(datesToBlock: { start: string; end: string; profileId:number }[]): void {
    const profileId = AuthenticatedUser.getAuthUserProfileId();

    this.availabilityService.batchCreateAvailability(profileId, datesToBlock).subscribe({
      next: () => {
        this.fetchAllAvailability(new Date(datesToBlock[0].start));
        alert('All availability slots successfully created!');
      },
      error: (err) => {
        console.error('Failed to block book availability:', err);
        alert(' Failed to update availability. Check for existing slots and try again.');
      }
    });
  }
}
