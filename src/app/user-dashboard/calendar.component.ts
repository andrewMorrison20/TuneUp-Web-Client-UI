import { Component, EventEmitter, Output } from '@angular/core';
import { CalendarOptions, DateSelectArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { FullCalendarComponent } from "@fullcalendar/angular";

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  //styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {

  @Output() monthChanged = new EventEmitter<{ start: Date, end: Date }>();
  @Output() dateSelected = new EventEmitter<{ start: string, end: string }>();

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    selectable: true,
    plugins: [dayGridPlugin, interactionPlugin],
    height: 'auto',
    events: [],
    datesSet: this.onMonthChange.bind(this),
    select: this.onDateSelect.bind(this)
  };

  private onMonthChange(info: any): void {
    if (!info.start || !info.end) return;
    this.monthChanged.emit({ start: info.start, end: info.end }); // Emit month change event
  }

  private onDateSelect(selectInfo: DateSelectArg): void {
    this.dateSelected.emit({ start: selectInfo.startStr, end: selectInfo.endStr }); // Emit date select event
  }

  updateCalendarEvents(events: any[]): void {
    this.calendarOptions = { ...this.calendarOptions, events }; // Update calendar events dynamically
  }
}
