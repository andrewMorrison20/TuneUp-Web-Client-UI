import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ScheduleComponent } from './schedule.component';
import { AvailabilityService } from '../../lessons/availability.service';
import { AuthenticatedUser } from '../../authentication/authenticated-user.class';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarApi } from '@fullcalendar/core';

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

  describe('view switching', () => {
    it('onDateClick → timeGridDay + flag', () => {
      component.onDateClick({ dateStr: '2025-04-05' });
      expect(fakeApi.changeView).toHaveBeenCalledWith('timeGridDay', '2025-04-05');
      expect(component.isTimeGridView).toBeTrue();
    });
    it('switchToMonthView → dayGridMonth + clear flag', () => {
      component.isTimeGridView = true;
      component.switchToMonthView();
      expect(fakeApi.changeView).toHaveBeenCalledWith('dayGridMonth');
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
});
