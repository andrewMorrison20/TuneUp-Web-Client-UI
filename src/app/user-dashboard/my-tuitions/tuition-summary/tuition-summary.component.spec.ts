import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TuitionSummaryComponent } from './tuition-summary.component';
import { AvailabilityService } from '../../../lessons/availability.service';
import { ProfileService } from '../../../profiles/profile.service';
import { TuitionsService } from '../tuitions.service';
import { AuthenticatedUser } from '../../../authentication/authenticated-user.class';
import { LessonSummaryDialogComponent } from './lesson-summary/lesson-summary-dialgoue.component';
import { LessonSummary } from './lesson-summary/lesson-summary.model';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { SharedModule } from '../../../shared/shared.module';

describe('TuitionSummaryComponent', () => {
  let component: TuitionSummaryComponent;
  let fixture: ComponentFixture<TuitionSummaryComponent>;
  let availabilityService: jasmine.SpyObj<AvailabilityService>;
  let profileService: jasmine.SpyObj<ProfileService>;
  let tuitionsService: jasmine.SpyObj<TuitionsService>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  const mockRoute = {
    snapshot: { paramMap: { get: jasmine.createSpy().and.returnValue('42') } }
  };

  beforeEach(async () => {
    availabilityService = jasmine.createSpyObj('AvailabilityService', [
      'getTuitionSummary',
      'getTuitionLessonSummary'
    ]);
    profileService = jasmine.createSpyObj('ProfileService', [
      'getProfileById',
      'createReview'
    ]);
    tuitionsService = jasmine.createSpyObj('TuitionsService', ['deactivateTuition']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    spyOn(AuthenticatedUser, 'getAuthUserProfileId').and.returnValue(100);

    await TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [TuitionSummaryComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: AvailabilityService, useValue: availabilityService },
        { provide: ProfileService, useValue: profileService },
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
        { provide: TuitionsService, useValue: tuitionsService },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TuitionSummaryComponent);
    component = fixture.componentInstance;
    component.calendarComponent = {
      getApi: () => ({ changeView: jasmine.createSpy('changeView'), getDate: () => new Date(2025, 3, 19) })
    } as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load data on success', () => {
      const summary = { id: 1, startDate: '2025-04-19T00:00:00Z' };
      const user = { displayName: 'User' } as any;
      const profile = { id: 42 } as any;
      availabilityService.getTuitionSummary.and.returnValue(of(summary));
      profileService.getProfileById.and.returnValues(of(user), of(profile));
      spyOn<any>(component, 'fetchLessons');
      spyOn<any>(component, 'initializeCalendar');
      spyOn<any>(component, 'updateCalendarEvents');

      component.ngOnInit();

      expect(mockRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
      expect(availabilityService.getTuitionSummary).toHaveBeenCalledWith(42, 100);
      expect(profileService.getProfileById).toHaveBeenCalledTimes(2);
      expect(component.tuitionSummary).toEqual(summary);
      expect(component.userProfile).toEqual(user);
      expect(component.profile).toEqual(profile);
      expect((component as any).fetchLessons).toHaveBeenCalled();
      expect((component as any).initializeCalendar).toHaveBeenCalled();
      expect((component as any).updateCalendarEvents).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    });

    it('should log error when forkJoin fails', () => {
      const err = new Error('fail');
      availabilityService.getTuitionSummary.and.returnValue(throwError(() => err));
      const consoleSpy = spyOn(console, 'error');

      component.ngOnInit();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to load all required data', err);
    });
  });

  describe('initializeCalendar', () => {
    it('should set calendar options correctly', () => {
      (component as any).initializeCalendar();
      expect(component.calendarOptions.initialView).toBe('dayGridMonth');
      expect(component.calendarOptions.plugins).toEqual([dayGridPlugin, timeGridPlugin, interactionPlugin]);
    });
  });

  describe('fetchTuitionSummary', () => {
    it('should set summary and fetch lessons', () => {
      const summary = { id: 2, startDate: '2025-04-01' };
      spyOn<any>(component, 'fetchLessons');
      const consoleLogSpy = spyOn(console, 'log');
      availabilityService.getTuitionSummary.and.returnValue(of(summary));

      component.fetchTuitionSummary();

      expect(component.tuitionSummary).toBe(summary);
      expect((component.tuitionDetails.startDate as any)).toBe(summary.startDate as any);
      expect((component as any).fetchLessons).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('TUITION SUMMARY', summary);
    });
  });

  describe('fetchLessons', () => {
    it('should not call service if profile missing', () => {
      component.profile = undefined as any;
      availabilityService.getTuitionLessonSummary.and.returnValue(of([]));

      (component as any).fetchLessons(new Date());

      expect(availabilityService.getTuitionLessonSummary).not.toHaveBeenCalled();
    });

    it('should fetch and update slots', () => {
      const lesson: LessonSummary = { lessonStatus: 'CONFIRMED', availabilityDto: { startTime: 's', endTime: 'e' } } as any;
      component.profile = { id: 3 } as any;
      component.tuitionSummary = { id: 5 } as any;
      spyOn<any>(component, 'updateCalendarEvents');
      availabilityService.getTuitionLessonSummary.and.returnValue(of([lesson]));

      (component as any).fetchLessons(new Date());
      expect(component.availabilitySlots).toEqual([lesson]);
      expect((component as any).updateCalendarEvents).toHaveBeenCalled();
    });
  });

  describe('updateCalendarEvents & getEventColor', () => {
    beforeEach(() => {
      component.availabilitySlots = [{ lessonStatus: 'confirmed', availabilityDto: { startTime: 's', endTime: 'e' } } as any];
      component.calendarOptions = { events: [] } as any;
      (component as any).updateCalendarEvents();
    });

    it('should map slots into events with colors', () => {
      const events = component.calendarOptions.events as any[];
      expect(events.length).toBe(1);
      expect(events[0].color).toBe('#4CAF50');
    });

    it('should return correct colors for statuses', () => {
      expect((component as any).getEventColor('CONFIRMED')).toBe('#4CAF50');
      expect((component as any).getEventColor('COMPLETED')).toBe('#9E9E9E');
      expect((component as any).getEventColor('CANCELLED')).toBe('#FF0000');
      expect((component as any).getEventColor('UNKNOWN')).toBe('#000000');
    });
  });

  describe('onLessonClick', () => {
    it('should open dialog and refresh on cancel', fakeAsync(() => {
      const lesson = { id: 1 } as any;
      const dialogRef = { afterClosed: () => of('cancelled') } as MatDialogRef<any>;
      dialog.open.and.returnValue(dialogRef);
      spyOn<any>(component, 'fetchLessons');

      component.onLessonClick({ event: { extendedProps: { lesson } } } as any);
      expect(dialog.open).toHaveBeenCalledWith(LessonSummaryDialogComponent, { height: '700px', data: { lesson } });
      tick();
      expect((component as any).fetchLessons).toHaveBeenCalled();
    }));
  });

  describe('view methods', () => {
    describe('onDateClick', () => {

      it('should switch the calendar to timeGridDay view when a date is clicked', () => {
        const api = {
          changeView: jasmine.createSpy('changeView'),
          getDate: () => new Date()
        };

        component.calendarComponent.getApi = () => api as any;
        component.onDateClick({ dateStr: '2025-04-19' } as any);
        expect(api.changeView).toHaveBeenCalledWith('timeGridDay', '2025-04-19');
        expect(component.isTimeGridView).toBeTrue();
      });
    });

    it('onMonthChange triggers fetchLessons', () => {
      spyOn<any>(component, 'fetchLessons');
      (component as any).onMonthChange({} as any);
      expect((component as any).fetchLessons).toHaveBeenCalled();
    });

    it('goBackToTuitions navigates', () => {
      component.goBackToTuitions();
      expect(router.navigate).toHaveBeenCalledWith(['/user-dashboard/my-tuitions'], { queryParams: { tab: 1 } });
    });
  });

  describe('fetchProfiles', () => {
    it('loads and logs profiles', () => {

      component.profileId = 42;
      const user = { displayName: 'U' } as any;
      const tuition = { id: 10 } as any;
      profileService.getProfileById.and.returnValues(of(user), of(tuition));
      const consoleLogSpy = spyOn(console, 'log');

      component.fetchProfiles();

      expect(profileService.getProfileById).toHaveBeenCalledWith(100);  // AuthenticatedUser
      expect(profileService.getProfileById).toHaveBeenCalledWith(42);   // this.profileId
      expect(consoleLogSpy).toHaveBeenCalledWith('Current user Profile:', user);
      expect(consoleLogSpy).toHaveBeenCalledWith('Tuition Profile:', tuition);
    });
  });

  describe('deactivateTuition', () => {
    it('does nothing on cancel', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      tuitionsService.deactivateTuition.and.returnValue(of(void 0));

      component.tuitionSummary = { id: 99 } as any;
      component.deactivateTuition();
      expect(tuitionsService.deactivateTuition).not.toHaveBeenCalled();
    });

    it('opens snackBar on success', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      tuitionsService.deactivateTuition.and.returnValue(of(void 0));

      component.tuitionSummary = { id: 99 } as any;
      component.deactivateTuition();
      expect(snackBar.open).toHaveBeenCalledWith('Tuition successfully deactivated.', 'OK', { duration: 3000 });
    });

    it('logs and shows error on failure', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const err = new Error('fail');
      tuitionsService.deactivateTuition.and.returnValue(throwError(() => err));
      const consoleSpy = spyOn(console, 'error');

      component.tuitionSummary = { id: 100 } as any;
      component.deactivateTuition();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to deactivate tuition:', err);
      expect(snackBar.open).toHaveBeenCalledWith('Error deactivating tuition. Please try again.', 'Close', { duration: 4000 });
    });
  });

  describe('leaveReview', () => {
    it('does not call submitReview when closed without result', fakeAsync(() => {
      const dialogRef = { afterClosed: () => of(null) } as MatDialogRef<any>;
      dialog.open.and.returnValue(dialogRef);
      spyOn<any>(component, 'submitReview');

      component.leaveReview('TutorName');
      tick();
      expect((component as any).submitReview).not.toHaveBeenCalled();
    }));

    it('calls submitReview when result returned', fakeAsync(() => {
      const result = { rating: 5, title: 'T', content: 'C' };
      const dialogRef = { afterClosed: () => of(result) } as MatDialogRef<any>;
      dialog.open.and.returnValue(dialogRef);
      spyOn<any>(component, 'submitReview');

      component.leaveReview('TutorName');
      tick();
      expect((component as any).submitReview).toHaveBeenCalledWith(result);
    }));
  });

  describe('submitReview', () => {
    beforeEach(() => {
      component.profile = { id: 7, displayName: 'Tutor' } as any;
      component.userProfile = { displayName: 'Tutor' } as any;    // ← add this
      component.tuitionSummary = { id: 15 } as any;
      spyOn(console, 'log');
    });

    it('sends review and alerts success', fakeAsync(() => {
      const reviewData = { rating: 4, title: 'Good', content: 'Nice' };
      const dto = {
        profileId: 7,
        title: 'Good',
        comment: 'Nice',
        rating: 4,
        tuitionId: 15,
        reviewerProfileId: 100,
        reviewerName: 'Tutor'
      };
      profileService.createReview.and.returnValue(of(void 0));
      spyOn(window, 'alert');

      component.submitReview(reviewData);
      tick();
      expect(console.log).toHaveBeenCalledWith('Sending review to server:', reviewData);
      expect(profileService.createReview).toHaveBeenCalledWith(dto);
      expect(window.alert).toHaveBeenCalledWith('Review submitted successfully!');
    }));

    it('alerts on error', fakeAsync(() => {
      const reviewData = { rating: 2, title: 'Bad', content: 'No' };
      profileService.createReview.and.returnValue(throwError(() => new Error('err')));
      spyOn(window, 'alert');
      const consoleSpy = spyOn(console, 'error');

      component.submitReview(reviewData);
      tick();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to submit review:', jasmine.any(Error));
      expect(window.alert).toHaveBeenCalledWith('Error submitting review. Please try again.');
    }));
  });
});
