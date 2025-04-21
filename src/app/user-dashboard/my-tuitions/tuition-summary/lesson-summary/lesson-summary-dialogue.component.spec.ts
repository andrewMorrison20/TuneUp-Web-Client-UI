import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AddressService } from '../../../update-profile/address/address-service.component';
import { AvailabilityService } from '../../../../lessons/availability.service';
import { LessonSummary } from './lesson-summary.model';
import {LessonSummaryDialogComponent} from "./lesson-summary-dialgoue.component";
import {SharedModule} from "../../../../shared/shared.module";

const mockAddressDto = {
  id: 1,
  postcode: 'N1 1AA',
  city: 'London',
  country: 'UK',
  addressLine1: '1 Test St',
  addressLine2: '',
  latitude: 1,
  longitude: 2
} as any;

describe('LessonSummaryDialogComponent', () => {
  let component: LessonSummaryDialogComponent;
  let fixture: ComponentFixture<LessonSummaryDialogComponent>;
  let addressServiceSpy: jasmine.SpyObj<AddressService>;
  let availabilityServiceSpy: jasmine.SpyObj<AvailabilityService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<LessonSummaryDialogComponent>>;

  const mockLesson: LessonSummary = { id: 99, lessonType: 'In Person', tuitionId: 123 } as any;

  beforeEach(async () => {
    addressServiceSpy = jasmine.createSpyObj('AddressService', ['getLessonTutorLocation']);
    availabilityServiceSpy = jasmine.createSpyObj('AvailabilityService', ['cancelLessonById', 'updateLessonStatus']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [LessonSummaryDialogComponent],
      imports : [SharedModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { lesson: mockLesson, address: null } },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: AddressService, useValue: addressServiceSpy },
        { provide: AvailabilityService, useValue: availabilityServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LessonSummaryDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('fetches lesson location for in-person lessons', fakeAsync(() => {

      addressServiceSpy.getLessonTutorLocation.and.returnValue(of(mockAddressDto));
      const setMapSpy = spyOn<any>(component, 'setMapCoordinates');

      component.ngOnInit();
      tick();

      expect(setMapSpy).toHaveBeenCalledWith(1, 2);
      expect(component.data.address).toEqual(mockAddressDto);
    }));

    it('handles fetch location error', fakeAsync(() => {

      component.data.lesson.lessonType = 'In Person';
      component.data.address = null;

      const err = new Error('fail');
      addressServiceSpy.getLessonTutorLocation.and.returnValue(throwError(() => err));
      const alertSpy   = spyOn(window, 'alert');
      const consoleSpy = spyOn(console, 'error');
      component.ngOnInit();
      tick();

      expect(consoleSpy)
        .toHaveBeenCalledWith('Error fetching lesson location:', err);
      expect(alertSpy)
        .toHaveBeenCalledWith('Error retrieving lesson location. Refresh the page.');
    }));


    it('sets map coordinates for non in-person when address present', () => {
      // Override data as home lesson
      component.data.address = mockAddressDto as any;
      component.data.lesson.lessonType = 'Online';
      spyOn<any>(component, 'setMapCoordinates');

      component.ngOnInit();

      expect((component as any).setMapCoordinates).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('setMapCoordinates', () => {
    it('should set lat, lon, and showMap', () => {
      component['setMapCoordinates'](5, 6);
      expect(component.latitude).toBe(5);
      expect(component.longitude).toBe(6);
      expect(component.showMap).toBeTrue();
    });
  });

  describe('cancelLesson', () => {
    it('cancels lesson and closes dialog on success', fakeAsync(() => {
      availabilityServiceSpy.cancelLessonById.and.returnValue(of({} as any));
      const consoleSpy = spyOn(console, 'log');

      component.cancelLesson();
      tick();

      expect(consoleSpy).toHaveBeenCalledWith('Cancelling Lesson ID:', 99);
      expect(consoleSpy).toHaveBeenCalledWith('Lesson cancelled. Reset availability: false');
      expect(dialogRefSpy.close).toHaveBeenCalledWith('cancelled');
    }));

    it('handles cancellation error without closing', fakeAsync(() => {
      const err = new Error('fail');
      availabilityServiceSpy.cancelLessonById.and.returnValue(throwError(() => err));
      const consoleSpy = spyOn(console, 'error');

      component.cancelLesson();
      tick();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to cancel lesson:', err);
    }));
  });

  describe('redirectToStudyHub', () => {
    it('logs redirection', () => {
      const consoleSpy = spyOn(console, 'log');
      component.redirectToStudyHub();
      expect(consoleSpy).toHaveBeenCalledWith('Redirecting to Study Hub for Lesson ID:', 99);
    });
  });

  describe('closeDialog', () => {
    it('closes the dialog', () => {
      component.closeDialog();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });

  describe('showAlert', () => {
    it('calls window.alert', () => {
      const alertSpy = spyOn(window, 'alert');
      (component as any).showAlert('Test');
      expect(alertSpy).toHaveBeenCalledWith('Test');
    });
  });

  describe('updateLessonStatus', () => {
    it('updates status and alerts on success', fakeAsync(() => {
      availabilityServiceSpy.updateLessonStatus.and.returnValue(of({} as any));
      const consoleSpy = spyOn(console, 'log');
      const alertSpy = spyOn(window, 'alert');

      component.updateLessonStatus('COMPLETED', 99);
      tick();

      expect(consoleSpy).toHaveBeenCalledWith('Lesson status updated');
      expect(dialogRefSpy.close).toHaveBeenCalledWith('updated');
      expect(alertSpy).toHaveBeenCalledWith('Lesson successfully marked as completed');
    }));

    it('alerts and logs on error', fakeAsync(() => {
      const err = new Error('fail');
      availabilityServiceSpy.updateLessonStatus.and.returnValue(throwError(() => err));
      const consoleSpy = spyOn(console, 'error');
      const alertSpy = spyOn(window, 'alert');

      component.updateLessonStatus('CANCELLED', 99);
      tick();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to cancel lesson:', err);
      expect(alertSpy).toHaveBeenCalledWith('Unable to update lesson status, please try again.');
    }));
  });

  describe('goToPayments', () => {
    it('navigates to payments and closes dialog', () => {
      component.goToPayments();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/user-dashboard/payments']);
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });

  describe('fetchLessonLocation', () => {
    it('should set coordinates and update data.address when in-person address is valid', fakeAsync(() => {

      const address = { latitude: 10, longitude: 20 } as any;
      addressServiceSpy.getLessonTutorLocation.and.returnValue(of(address));
      spyOn<any>(component, 'setMapCoordinates');

      (component as any).fetchLessonLocation(123);
      tick();

      expect(addressServiceSpy.getLessonTutorLocation).toHaveBeenCalledWith(123);
      expect((component as any).setMapCoordinates).toHaveBeenCalledWith(10, 20);
      expect(component.data.address).toBe(address);
    }));

    it('should log error and show alert when address fetch fails', fakeAsync(() => {

      const err = new Error('network');
      addressServiceSpy.getLessonTutorLocation.and.returnValue(throwError(() => err));
      const consoleSpy = spyOn(console, 'error');
      const alertSpy = spyOn<any>(component, 'showAlert');

      (component as any).fetchLessonLocation(456);
      tick();

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching lesson location:', err);
      expect(alertSpy).toHaveBeenCalledWith('Error retrieving lesson location. Refresh the page.');
    }));
  });

});
