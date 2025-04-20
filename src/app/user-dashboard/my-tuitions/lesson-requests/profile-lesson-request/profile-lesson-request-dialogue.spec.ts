import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { AvailabilityService } from '../../../../lessons/availability.service';
import { AuthenticatedUser } from '../../../../authentication/authenticated-user.class';
import {MyTuitionsModule} from "../../my-tuitions.module";
import {ProfileLessonRequestsDialogComponent} from "./profile-lesson-requests-dialgoue.component";

describe('ProfileLessonRequestsDialogComponent', () => {
  let component: ProfileLessonRequestsDialogComponent;
  let fixture: ComponentFixture<ProfileLessonRequestsDialogComponent>;
  let availabilityServiceSpy: jasmine.SpyObj<AvailabilityService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ProfileLessonRequestsDialogComponent>>;

  beforeEach(() => {
    spyOn(AuthenticatedUser, 'getAuthUserProfileId').and.returnValue(567);

    availabilityServiceSpy = jasmine.createSpyObj('AvailabilityService', [
      'getLessonRequestsByIds', 'updateLessonRequestStatus'
    ]);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports:[MyTuitionsModule],
      providers: [
        { provide: AvailabilityService, useValue: availabilityServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { profileId: 10, profileType: 'student' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileLessonRequestsDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('calls fetchLessonRequests', () => {
      spyOn(component, 'fetchLessonRequests');
      component.ngOnInit();
      expect(component.fetchLessonRequests).toHaveBeenCalled();
    });
  });

  describe('fetchLessonRequests', () => {
    const mockResponse = { content: [{ id: 1 }, { id: 2 }], totalElements: 2 } as any;

    it('sets lessonRequests and totalElements on success and logs them', () => {
      availabilityServiceSpy.getLessonRequestsByIds.and.returnValue(of(mockResponse));
      spyOn(console, 'log');

      component.fetchLessonRequests();

      expect(AuthenticatedUser.getAuthUserProfileId).toHaveBeenCalled();
      expect(availabilityServiceSpy.getLessonRequestsByIds)
        .toHaveBeenCalledWith(10, 567, component.pageIndex, component.pageSize);
      expect(component.lessonRequests).toEqual(mockResponse.content);
      expect(component.totalElements).toBe(2);

      expect(console.log).toHaveBeenCalledWith(mockResponse.content);
    });

    it('logs error on failure', () => {
      const error = new Error('fail');
      availabilityServiceSpy.getLessonRequestsByIds.and.returnValue(throwError(() => error));
      spyOn(console, 'error');
      spyOn(console, 'log');

      component.fetchLessonRequests();

      expect(console.error).toHaveBeenCalledWith('Error fetching lesson requests:', error);
      expect(console.log).toHaveBeenCalledWith([]);
      expect(component.lessonRequests).toEqual([]);
      expect(component.totalElements).toBe(0);
    });
  });

  describe('onPageChange', () => {
    it('updates pagination and refetches', () => {
      spyOn(component, 'fetchLessonRequests');
      const event: PageEvent = { pageIndex: 3, pageSize: 7, length: 0 };

      component.onPageChange(event);

      expect(component.pageIndex).toBe(3);
      expect(component.pageSize).toBe(7);
      expect(component.fetchLessonRequests).toHaveBeenCalled();
    });
  });

  describe('confirmRequest', () => {
    let consoleLogSpy: jasmine.Spy;
    let consoleErrorSpy: jasmine.Spy;
    let alertSpy: jasmine.Spy;
    let fetchSpy: jasmine.Spy;

    beforeEach(() => {
      consoleLogSpy   = spyOn(console, 'log');
      consoleErrorSpy = spyOn(console, 'error');
      alertSpy        = spyOn(window, 'alert');

      fetchSpy = spyOn(component, 'fetchLessonRequests');

      component.autoDeclineConflicts = false;
    });

    it('confirms request and refreshes on success', fakeAsync(() => {
      availabilityServiceSpy
        .updateLessonRequestStatus
        .and.returnValue(of(null));

      component.confirmRequest(123);

      expect(consoleLogSpy).toHaveBeenCalledWith('Confirming request: 123');
      expect(
        availabilityServiceSpy.updateLessonRequestStatus
      ).toHaveBeenCalledWith(123, 'CONFIRMED', false);

      tick();

      expect(consoleLogSpy).toHaveBeenCalledWith('Request 123 confirmed');
      expect(fetchSpy).toHaveBeenCalled();
    }));

    it('alerts and logs error on failure', fakeAsync(() => {
      const errObj = { error: { message: 'Oops' } };
      availabilityServiceSpy
        .updateLessonRequestStatus
        .and.returnValue(throwError(() => errObj));

      component.confirmRequest(456);
      expect(consoleLogSpy).toHaveBeenCalledWith('Confirming request: 456');

      tick();

      expect(alertSpy).toHaveBeenCalledWith('Failed to send request: Oops');
      expect(consoleErrorSpy)
        .toHaveBeenCalledWith('Error confirming request 456:', errObj);

      expect(fetchSpy).not.toHaveBeenCalled();
    }));
  });


  describe('denyRequest', () => {
    it('denies request and refreshes on success', fakeAsync(() => {
      availabilityServiceSpy.updateLessonRequestStatus.and.returnValue(of(null));
      spyOn(console, 'log');
      spyOn(component, 'fetchLessonRequests');

      component.denyRequest(789);
      expect(console.log).toHaveBeenCalledWith('Denying request: 789');
      expect(availabilityServiceSpy.updateLessonRequestStatus)
        .toHaveBeenCalledWith(789, 'DECLINED');

      tick();
      expect(console.log).toHaveBeenCalledWith('Request 789 denied');
      expect(component.fetchLessonRequests).toHaveBeenCalled();
    }));

    it('alerts and logs error on failure', fakeAsync(() => {
      const errObj = { error: {} };
      availabilityServiceSpy.updateLessonRequestStatus.and.returnValue(throwError(() => errObj));
      spyOn(window, 'alert');
      spyOn(console, 'error');
      spyOn(console, 'log');

      component.denyRequest(999);
      expect(console.log).toHaveBeenCalledWith('Denying request: 999');
      tick();
      expect(window.alert).toHaveBeenCalledWith('Failed to send request: Please try again.');
      expect(console.error).toHaveBeenCalledWith('Error denying request 999:', errObj);
    }));
  });

  describe('closeDialog', () => {
    it('closes the dialog', () => {
      component.closeDialog();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });
});
