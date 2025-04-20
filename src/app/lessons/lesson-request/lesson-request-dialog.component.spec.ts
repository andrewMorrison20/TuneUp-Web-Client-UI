import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LessonRequestDialogComponent } from './lesson-request-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AvailabilityService } from '../availability.service';
import { of, throwError } from 'rxjs';
import { AuthenticatedUser } from '../../authentication/authenticated-user.class';
import {LessonsModule} from "../lessons.module";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('LessonRequestDialogComponent', () => {
  let component: LessonRequestDialogComponent;
  let fixture: ComponentFixture<LessonRequestDialogComponent>;
  let availabilitySpy: jasmine.SpyObj<AvailabilityService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<LessonRequestDialogComponent>>;

  const mockData = {
    startTime: '2025-04-20T08:00:00Z',
    endTime:   '2025-04-20T10:00:00Z',
    lessonType: 'online & in-person',
    profileId:  5,
    availabilityId: 7
  };

  beforeEach(async () => {
    // Stub AuthenticatedUser
    spyOn(AuthenticatedUser, 'getAuthUserProfileId').and.returnValue(9);

    availabilitySpy = jasmine.createSpyObj('AvailabilityService', ['sendAvailabilityRequest']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [LessonsModule,NoopAnimationsModule],
      providers: [
        { provide: AvailabilityService, useValue: availabilitySpy },
        { provide: MatDialogRef,      useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA,   useValue: mockData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LessonRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit
  });

  it('should calculate available slots and select first slot on init', () => {
    expect(component.availableSlots.length).toBeGreaterThan(0);
    expect(component.selectedSlot).toEqual(component.availableSlots[0]);
  });

  it('toLocalISOString formats date correctly without trailing Z', () => {
    const date = new Date(Date.UTC(2025, 3, 20, 8, 0, 0));
    const str = (component as any).toLocalISOString(date);

    expect(str).toMatch(/^2025-04-20T\d{2}:\d{2}:\d{2}/);
    expect(str.endsWith('Z')).toBeFalse();
  });


  it('getLessonTypes returns correct array for data.lessonType', () => {
    const types = component.getLessonTypes();
    expect(types).toEqual(['Online','In Person']);
  });

  it('onCancel closes dialog without args', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('onRequest success: calls service and closes with true', fakeAsync(() => {
    availabilitySpy.sendAvailabilityRequest.and.returnValue(of({}));
    spyOn(console, 'log');

    component.selectedLessonType = 'Online';
    component.onRequest();
    // flush
    tick();

    expect(console.log).toHaveBeenCalledWith('Sending request with times:', jasmine.any(String), jasmine.any(String));
    expect(availabilitySpy.sendAvailabilityRequest)
      .toHaveBeenCalledWith(jasmine.any(String), jasmine.any(String), 9, 5, 7, 'Online');
    expect(console.log).toHaveBeenCalledWith('Lesson request sent and calendar refreshed.');
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  }));

  it('onRequest error: alerts and closes with false', fakeAsync(() => {
    const errorResponse = { error: { message: 'oops' } };
    availabilitySpy.sendAvailabilityRequest.and.returnValue(throwError(() => errorResponse));
    spyOn(console, 'error');
    spyOn(window, 'alert');

    component.selectedLessonType = 'Online';
    component.onRequest();
    tick();

    expect(console.error).toHaveBeenCalledWith('Error sending lesson request', errorResponse);
    expect(window.alert).toHaveBeenCalledWith('Failed to send request: oops');
    expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
  }));

  describe('onRequest()', () => {
    it('closes dialog with true on success', fakeAsync(() => {
      availabilitySpy.sendAvailabilityRequest.and.returnValue(of({}));
      component.onRequest();
      tick();
      expect(availabilitySpy.sendAvailabilityRequest).toHaveBeenCalled();
      expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    }));

    it('alerts and closes dialog with false on error', fakeAsync(() => {
      const fakeErr = { error: { message: 'oops' } };
      availabilitySpy.sendAvailabilityRequest.and.returnValue(throwError(() => fakeErr));
      spyOn(window, 'alert');
      component.onRequest();
      tick();
      expect(window.alert).toHaveBeenCalledWith('Failed to send request: oops');
      expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
    }));
  });

  describe('getLessonTypes()', () => {
    it('returns correct array for known types', () => {
      component.data.lessonType = 'Online & In-Person';
      expect(component.getLessonTypes()).toEqual(['Online', 'In Person']);

      component.data.lessonType = 'online';
      expect(component.getLessonTypes()).toEqual(['Online']);

      component.data.lessonType = 'IN PERSON';
      expect(component.getLessonTypes()).toEqual(['In Person']);
    });

    it('falls back to empty array for unknown lessonType', () => {
      component.data.lessonType = 'Totally New Mode';
      expect(component.getLessonTypes()).toEqual([]);
    });
  });
});
