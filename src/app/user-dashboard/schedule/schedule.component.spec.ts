import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ScheduleComponent } from './schedule.component';
import { AvailabilityService } from '../../lessons/availability.service';
import { AuthenticatedUser } from '../../authentication/authenticated-user.class';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import {CalendarApi, DateSelectArg} from '@fullcalendar/core';
import {
  LessonSummaryDialogComponent
} from "../my-tuitions/tuition-summary/lesson-summary/lesson-summary-dialgoue.component";

describe('ScheduleComponent', () => {
  let component: ScheduleComponent;
  let fixture: ComponentFixture<ScheduleComponent>;
  let availService: jasmine.SpyObj<AvailabilityService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const fakeApi: Partial<CalendarApi> = {
    changeView: jasmine.createSpy('changeView'),
    getDate: () => new Date(2025, 3, 1),
  };

  beforeEach(async () => {
    availService = jasmine.createSpyObj('AvailabilityService', [
      'getPeriodAvailabilityForProfile',
      'fetchLessonSummaryByAvailabilityId',
      'createAvailability',
      'updateAvailability',
      'deleteAvailability',
      'batchCreateAvailability'
    ]);
    availService.getPeriodAvailabilityForProfile.and.returnValue(of([]));

    dialog = jasmine.createSpyObj('MatDialog', ['open']);

    // spy once here:
    spyOn(AuthenticatedUser, 'getAuthUserProfileId').and.returnValue(42);

    await TestBed.configureTestingModule({
      declarations: [ScheduleComponent],
      providers: [
        { provide: AvailabilityService, useValue: availService },
        { provide: MatDialog, useValue: dialog },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(ScheduleComponent, {
        set: { template: '<div></div>' }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ScheduleComponent);
    component = fixture.componentInstance;
    component.calendarComponent = ({
      getApi: () => fakeApi
    } as any) as FullCalendarComponent;

    fixture.detectChanges();
  });

  describe('isValidInput()', () => {
    beforeEach(() => {
      component.blockBookData = {
        startDate: '', endDate: '',
        startTime: '', endTime: '',
        allDay: false, repeatWeekly: false, repeatUntil: ''
      };
      spyOn(window, 'alert');
    });

    it('rejects missing dates', () => {
      expect(component['isValidInput']()).toBeFalse();
      expect(window.alert).toHaveBeenCalled();
    });
    /* …other cases… */
  });

  describe('generateDatesToBlock()', () => {
    beforeEach(() => {
      // just override the existing spy:
      (AuthenticatedUser.getAuthUserProfileId as jasmine.Spy).and.returnValue(99);
    });

    it('generates 3 daily slots when no repeat', () => {
      component.blockBookData = {
        startDate: '2025-04-01', endDate: '2025-04-03',
        allDay: false, startTime: '08:00', endTime: '09:00',
        repeatWeekly: false, repeatUntil: ''
      } as any;
      const slots = component['generateDatesToBlock']();
      expect(slots.length).toBe(3);
      expect(slots[0]).toEqual({
        start:     '2025-04-01T08:00',
        end:       '2025-04-01T09:00',
        profileId: 99
      });
    });

    it('adds weekly repeats through 15th', () => {
      component.blockBookData = {
        startDate: '2025-04-01', endDate: '2025-04-01',
        allDay: false, startTime: '08:00', endTime: '09:00',
        repeatWeekly: true, repeatUntil: '2025-04-15'
      } as any;
      const slots = component['generateDatesToBlock']();
      expect(slots.length).toBe(3);
      expect(slots[1].start.startsWith('2025-04-08')).toBeTrue();
      expect(slots[2].start.startsWith('2025-04-15')).toBeTrue();
    });
  });

  describe('onDateClick & switchToMonthView', () => {
    it('switches to timeGridDay and sets flag', () => {

      const changeSpy = jasmine.createSpy('changeView');

      component.calendarComponent = ({
        getApi: () => ({ changeView: changeSpy } as any)
      } as any) as FullCalendarComponent;
      component.isTimeGridView = false;
      component.onDateClick({ dateStr: '2025-04-05' });
      expect(changeSpy).toHaveBeenCalledWith('timeGridDay', '2025-04-05');
      expect(component.isTimeGridView).toBeTrue();
    });

    it('switchToMonthView flips flag back', () => {
      // stub again, now for the month view switch
      const changeSpy = jasmine.createSpy('changeView');
      component.calendarComponent = ({
        getApi: () => ({ changeView: changeSpy } as any)
      } as any) as FullCalendarComponent;
      component.isTimeGridView = true;

      // Act
      component.switchToMonthView();

      // Assert
      expect(changeSpy).toHaveBeenCalledWith('dayGridMonth');
      expect(component.isTimeGridView).toBeFalse();
    });
  });


  it('fetchAllAvailability() success → slots + loading=false', fakeAsync(() => {
    const fakeSlots = [{ id:1, startTime:'a', endTime:'b', status:'AVAILABLE' }];
    availService.getPeriodAvailabilityForProfile.and.returnValue(of(fakeSlots));
    component.fetchAllAvailability(new Date(2025,3,1));
    tick();
    expect(component.availabilitySlots).toBe(fakeSlots);
    expect(component.loading).toBeFalse();
  }));

  it('fetchAllAvailability() error → loading=false', fakeAsync(() => {
    availService.getPeriodAvailabilityForProfile.and.returnValue(throwError(() => new Error()));
    component.fetchAllAvailability(new Date());
    tick();
    expect(component.loading).toBeFalse();
  }));

  describe('submitAvailabilitySlots', () => {
    let alertSpy: jasmine.Spy;
    let fetchSpy: jasmine.Spy;

    beforeEach(() => {
      alertSpy = spyOn(window, 'alert');
      fetchSpy = spyOn(component, 'fetchAvailabilityForCurrentMonth');
    });

    it('should batch‑create slots then refresh and alert on success', fakeAsync(() => {
      const fakeDates = [{ start: 'x', end: 'y', profileId: 1 }];
      availService.batchCreateAvailability.and.returnValue(of({}));

      component['submitAvailabilitySlots'](fakeDates);
      tick();

      expect(availService.batchCreateAvailability)
        .toHaveBeenCalledWith(42, fakeDates);
      expect(fetchSpy).toHaveBeenCalled();
      expect(alertSpy)
        .toHaveBeenCalledWith('All availability slots successfully created!');
    }));

    it('should log error and alert on failure', fakeAsync(() => {
      const err = new Error('oops');
      availService.batchCreateAvailability.and.returnValue(throwError(() => err));
      const consoleSpy = spyOn(console, 'error');

      component['submitAvailabilitySlots']([{ start: 'x', end: 'y', profileId: 1 }]);
      tick();

      expect(consoleSpy)
        .toHaveBeenCalledWith('Failed to block book availability:', err);
      expect(alertSpy)
        .toHaveBeenCalledWith(
          ' Failed to update availability. Check for existing slots and try again.'
        );
    }));
  });

  describe('fetchAvailabilityForCurrentMonth', () => {
    it('warns if calendarComponent is missing', () => {
      component.calendarComponent = undefined as any;
      const warnSpy = spyOn(console, 'warn');
      component.fetchAvailabilityForCurrentMonth();
      expect(warnSpy).toHaveBeenCalledWith(' Calendar component is not initialized yet.');
    });

    it('errors if getApi() is unavailable', () => {
      component.calendarComponent = { getApi: () => null } as any;
      const errorSpy = spyOn(console, 'error');
      component.fetchAvailabilityForCurrentMonth();
      expect(errorSpy).toHaveBeenCalledWith('FullCalendar API is unavailable.');
    });

    it('calls fetchAllAvailability with current date', () => {
      // stub calendarComponent.getApi().getDate()
      const fakeApi = { getDate: () => new Date(2025, 0, 15) } as any;
      component.calendarComponent = { getApi: () => fakeApi } as any;
      const fetchAllSpy = spyOn(component, 'fetchAllAvailability');
      component.fetchAvailabilityForCurrentMonth();
      expect(fetchAllSpy).toHaveBeenCalledWith(new Date(2025, 0, 15));
    });
  });

  describe('onResize', () => {
    let changeViewSpy: jasmine.Spy;
    let switchSpy: jasmine.Spy;

    beforeEach(() => {
      // stub out calendarComponent.getApi().changeView()
      const fakeApi = { changeView: jasmine.createSpy('changeView'), getDate: () => new Date() } as any;
      component.calendarComponent = { getApi: () => fakeApi } as any;
      changeViewSpy = fakeApi.changeView;
      switchSpy = spyOn(component, 'switchToMonthView');
    });

    it('should go to timeGridDay when narrow and not in timeGrid', () => {
      component.isTimeGridView = false;
      spyOnProperty(window, 'innerWidth').and.returnValue(700);
      const today = new Date().toISOString().split('T')[0];

      component.onResize();
      expect(changeViewSpy).toHaveBeenCalledWith('timeGridDay', today);
      expect(component.isTimeGridView).toBeTrue();
    });

    it('should switch back to month view when wide and in timeGrid', () => {
      component.isTimeGridView = true;
      spyOnProperty(window, 'innerWidth').and.returnValue(1024);

      component.onResize();
      expect(switchSpy).toHaveBeenCalled();
    });
  });
  describe('onMultiSlotSelect', () => {
    beforeEach(() => {
      // stub out calendar API
      const fakeApi = {
        unselect: jasmine.createSpy('unselect')
      } as any;
      component.calendarComponent = { getApi: () => fakeApi } as any;
    });

    it('alerts and unselects when the new slot overlaps an existing one', () => {
      component.availabilitySlots = [
        { startTime: '2025-04-10T10:00:00', endTime: '2025-04-10T11:00:00' }
      ];
      const selectInfo = ({
        start:    '2025-04-10T10:30:00',
        end:      '2025-04-10T10:45:00',
        startStr: '2025-04-10T10:30:00',
        endStr:   '2025-04-10T10:45:00'
      } as unknown) as DateSelectArg;

      const alertSpy = spyOn(window, 'alert');
      component['onMultiSlotSelect'](selectInfo);

      expect(alertSpy)
        .toHaveBeenCalledWith(' Selected slot overlaps with existing availability.');
      expect(component.calendarComponent.getApi().unselect)
        .toHaveBeenCalled();
    });

    it('calls openAvailabilityDialog when there is no overlap', () => {
      component.availabilitySlots = [
        { startTime: '2025-04-10T10:00:00', endTime: '2025-04-10T11:00:00' }
      ];
      const selectInfo = ({
        start:    '2025-04-10T11:30:00',
        end:      '2025-04-10T12:00:00',
        startStr: '2025-04-10T11:30:00',
        endStr:   '2025-04-10T12:00:00'
      } as unknown) as DateSelectArg;

      const openSpy = spyOn<any>(component, 'openAvailabilityDialog');
      component['onMultiSlotSelect'](selectInfo);

      expect(openSpy)
        .toHaveBeenCalledWith(selectInfo.startStr, selectInfo.endStr, false);
    });
  });

  describe('onLessonClick', () => {
    let fakeDialogRef: { afterClosed: jasmine.Spy; };
    let info: any;

    beforeEach(() => {
      info = {
        event: {
          extendedProps: {
            slot: {
              id:          77,
              profileId:   42,
              startTime:   '2025-04-10T09:00:00',
              endTime:     '2025-04-10T10:00:00',
              status:      'AVAILABLE'
            }
          }
        }
      };

      fakeDialogRef = {
        afterClosed: jasmine.createSpy('afterClosed')
          .and.returnValue(of('cancelled') /* default */)
      };
      dialog.open.and.returnValue(fakeDialogRef as any);

      availService.fetchLessonSummaryByAvailabilityId.and.returnValue(of({
        foo: 'bar'
      } as any));

      spyOn(component, 'fetchAvailabilityForCurrentMonth');
    });

    it('should fetch summary, open dialog, and on "cancelled" re‑fetch availability', fakeAsync(() => {
      component.onLessonClick(info);
      tick();

      expect(availService.fetchLessonSummaryByAvailabilityId)
        .toHaveBeenCalledWith(77);

      expect(dialog.open).toHaveBeenCalledWith(LessonSummaryDialogComponent, jasmine.objectContaining({
        data: jasmine.objectContaining({
          lesson: jasmine.objectContaining({
            foo: 'bar',
            availabilityDto: jasmine.objectContaining({
              id:        77,
              profileId: 42,
              startTime:'2025-04-10T09:00:00',
              endTime:  '2025-04-10T10:00:00',
              status:   'AVAILABLE'
            })
          }),
          address: null
        })
      }));


      expect(fakeDialogRef.afterClosed).toHaveBeenCalled();
      expect(component.fetchAvailabilityForCurrentMonth).toHaveBeenCalled();
    }));

    it('should log and alert when the fetch throws', fakeAsync(() => {
      const err = new Error('oops');
      availService.fetchLessonSummaryByAvailabilityId
        .and.returnValue(throwError(() => err));

      const consoleSpy = spyOn(console, 'error');
      const alertSpy   = spyOn(window, 'alert');

      component.onLessonClick(info);
      tick();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch lesson summary:', err);
      expect(alertSpy).toHaveBeenCalledWith('Failed to load lesson details. Please try again later.');
      expect(dialog.open).not.toHaveBeenCalled();
    }));
  });
  describe('onBlockBookSubmit', () => {
    let alertSpy: jasmine.Spy;

    beforeEach(() => {
      alertSpy = spyOn(window, 'alert');
      // Stub out the internal helpers; we’ll override per‑test
      spyOn<any>(component, 'isValidInput').and.returnValue(true);
      spyOn<any>(component, 'generateDatesToBlock').and.returnValue([]);
      spyOn<any>(component, 'submitAvailabilitySlots');
    });

    it('should do nothing when input is invalid', () => {
      (component as any).isValidInput.and.returnValue(false);

      component.onBlockBookSubmit();

      // never generate slots, never alert, never submit
      expect((component as any).generateDatesToBlock).not.toHaveBeenCalled();
      expect(alertSpy).not.toHaveBeenCalled();
      expect((component as any).submitAvailabilitySlots).not.toHaveBeenCalled();
    });

    it('should alert when there are no slots to block', () => {
      (component as any).generateDatesToBlock.and.returnValue([]);

      component.onBlockBookSubmit();

      expect((component as any).isValidInput).toHaveBeenCalled();
      expect((component as any).generateDatesToBlock).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('No valid availability slots found.');
      expect((component as any).submitAvailabilitySlots).not.toHaveBeenCalled();
    });

    it('should submit slots when there are some to block', () => {
      const fakeSlots = [
        { start: '2025-04-01T09:00', end: '2025-04-01T10:00', profileId: 1 }
      ];
      (component as any).generateDatesToBlock.and.returnValue(fakeSlots);

      component.onBlockBookSubmit();

      expect(alertSpy).not.toHaveBeenCalled();
      expect((component as any).submitAvailabilitySlots).toHaveBeenCalledWith(fakeSlots);
    });
  });

  describe('onMonthChange', () => {
    it('should warn and bail if calendarComponent is not initialized', () => {
      spyOn(console, 'warn');
      component.calendarComponent = undefined!;      // simulate missing calendar
      ;(component as any).onMonthChange({} as any);
      expect(console.warn).toHaveBeenCalledWith(' calendarComponent not initialized yet.');
    });

    it('should calculate month range and then fetchAvailabilityForCurrentMonth', () => {
      // arrange a fake API that returns a known date
      const fakeDate = new Date(2025, 6, 15);       // July 15, 2025
      const fakeApi = { getDate: () => fakeDate };
      component.calendarComponent = { getApi: () => fakeApi } as any;

      const logSpy    = spyOn(console, 'log');
      const fetchSpy  = spyOn(component, 'fetchAvailabilityForCurrentMonth');

      ;(component as any).onMonthChange({} as any);

      const expectedStart = new Date(2025, 6, 1).toISOString();
      const expectedEnd   = new Date(2025, 7, 0).toISOString(); // last day of July

      expect(logSpy).toHaveBeenCalledWith(
        ` Fetching for month: ${expectedStart} to ${expectedEnd}`
      );
      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  describe('isValidInput', () => {
    beforeEach(() => {
      // always spy the global alert
      spyOn(window, 'alert');
    });

    it('rejects missing dates', () => {
      component.blockBookData = { startDate: '', endDate: '', allDay: false, startTime: '', endTime: '', repeatWeekly: false, repeatUntil: '' } as any;
      expect(component['isValidInput']()).toBeFalse();
      expect(window.alert).toHaveBeenCalledWith(' Please select a valid start and end date.');
    });

    it('rejects when startDate is after endDate', () => {
      component.blockBookData = {
        startDate: '2025-04-05',
        endDate:   '2025-04-01',
        allDay: false, startTime: '09:00', endTime: '10:00',
        repeatWeekly: false, repeatUntil: ''
      } as any;
      expect(component['isValidInput']()).toBeFalse();
      expect(window.alert).toHaveBeenCalledWith(' Start date cannot be after end date.');
    });

    it('rejects missing times when not allDay', () => {
      component.blockBookData = {
        startDate: '2025-04-01',
        endDate:   '2025-04-02',
        allDay: false, startTime: '', endTime: '',
        repeatWeekly: false, repeatUntil: ''
      } as any;
      expect(component['isValidInput']()).toBeFalse();
      expect(window.alert).toHaveBeenCalledWith(' Please select a start and end time.');
    });

    it('rejects when startTime ≥ endTime', () => {
      component.blockBookData = {
        startDate: '2025-04-01',
        endDate:   '2025-04-01',
        allDay: false, startTime: '12:00', endTime: '11:00',
        repeatWeekly: false, repeatUntil: ''
      } as any;
      expect(component['isValidInput']()).toBeFalse();
      expect(window.alert).toHaveBeenCalledWith(' Start time must be before end time.');
    });

    it('accepts a valid all‑day range even if no times provided', () => {
      component.blockBookData = {
        startDate: '2025-04-01',
        endDate:   '2025-04-02',
        allDay:    true, startTime: '', endTime: '',
        repeatWeekly: false, repeatUntil: ''
      } as any;
      expect(component['isValidInput']()).toBeTrue();
      // no alert should have been called again
      expect(window.alert).toHaveBeenCalledTimes(0);
    });

    it('accepts a valid timed range', () => {
      component.blockBookData = {
        startDate: '2025-04-01',
        endDate:   '2025-04-02',
        allDay:    false, startTime: '09:00', endTime: '17:00',
        repeatWeekly: false, repeatUntil: ''
      } as any;
      expect(component['isValidInput']()).toBeTrue();
    });
  });
});
