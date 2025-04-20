import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { LessonRequestsComponent } from './lesson-requests.component';
import { AvailabilityService } from '../../../lessons/availability.service';
import { AuthenticatedUser } from '../../../authentication/authenticated-user.class';
import { ProfileLessonRequestsDialogComponent } from './profile-lesson-request/profile-lesson-requests-dialgoue.component';
import { TutorProfile } from '../../../profiles/interfaces/tutor.model';
import { StudentProfile } from '../../../profiles/interfaces/student.model';
import {SharedModule} from "../../../shared/shared.module";

type Profile = TutorProfile | StudentProfile;

describe('LessonRequestsComponent', () => {
  let component: LessonRequestsComponent;
  let fixture: ComponentFixture<LessonRequestsComponent>;
  let availabilityServiceSpy: jasmine.SpyObj<AvailabilityService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    // Stub AuthenticatedUser
    spyOn(AuthenticatedUser, 'getAuthUserProfileId').and.returnValue(100);

    availabilityServiceSpy = jasmine.createSpyObj('AvailabilityService', ['fetchRequestProfiles']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [LessonRequestsComponent],
      imports:[SharedModule],
      providers: [
        { provide: AvailabilityService, useValue: availabilityServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LessonRequestsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call fetchLessonRequestProfiles', () => {
      spyOn(component, 'fetchLessonRequestProfiles');
      component.ngOnInit();
      expect(component.fetchLessonRequestProfiles).toHaveBeenCalled();
    });
  });

  describe('fetchLessonRequestProfiles', () => {
    const mockResponse = { content: [{ id: 1 }], totalElements: 3 } as any;

    it('should load profiles successfully', () => {
      availabilityServiceSpy.fetchRequestProfiles.and.returnValue(of(mockResponse));

      component.isLoading = false;
      component.profiles = [];
      component.totalElements = 0;

      component.fetchLessonRequestProfiles();

      expect(AuthenticatedUser.getAuthUserProfileId).toHaveBeenCalled();
      expect(availabilityServiceSpy.fetchRequestProfiles)
        .toHaveBeenCalledWith(100, component.pageIndex, component.pageSize);
      expect(component.profiles).toEqual(mockResponse.content);
      expect(component.totalElements).toBe(3);
      expect(component.isLoading).toBeFalse();
    });

    it('should handle error and stop loading', () => {
      spyOn(console, 'error');
      availabilityServiceSpy.fetchRequestProfiles.and.returnValue(throwError(() => new Error('fail')));

      component.isLoading = true;
      component.fetchLessonRequestProfiles();

      expect(console.error).toHaveBeenCalledWith('Error fetching profiles:', jasmine.any(Error));
      expect(component.isLoading).toBeFalse();
      expect(component.profiles).toEqual([]);
      expect(component.totalElements).toBe(0);
    });
  });

  describe('onPageChange', () => {
    it('should update pagination and refetch', () => {
      spyOn(component, 'fetchLessonRequestProfiles');
      const event: PageEvent = { pageIndex: 2, pageSize: 5, length: 0 };

      component.onPageChange(event);

      expect(component.pageIndex).toBe(2);
      expect(component.pageSize).toBe(5);
      expect(component.fetchLessonRequestProfiles).toHaveBeenCalled();
    });
  });

  describe('openLessonRequestsDialog', () => {
    it('should open dialog with correct data and refresh after close', fakeAsync(() => {
      const dialogRefMock = { afterClosed: () => of(null) } as MatDialogRef<any>;
      dialogSpy.open.and.returnValue(dialogRefMock);
      spyOn(component, 'fetchLessonRequestProfiles');

      component.openLessonRequestsDialog(55, 'tutor');
      expect(dialogSpy.open).toHaveBeenCalledWith(ProfileLessonRequestsDialogComponent, {
        data: { profileId: 55, profileType: 'tutor' }
      });

      tick();
      expect(component.fetchLessonRequestProfiles).toHaveBeenCalled();
    }));
  });
});
