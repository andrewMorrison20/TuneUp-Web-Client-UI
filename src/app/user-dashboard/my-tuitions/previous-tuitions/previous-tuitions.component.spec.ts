import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { PreviousTuitionsComponent } from './previous-tuitions.component';
import { AvailabilityService } from '../../../lessons/availability.service';
import { AuthenticatedUser } from '../../../authentication/authenticated-user.class';
import { TutorProfile } from '../../../profiles/interfaces/tutor.model';
import { StudentProfile } from '../../../profiles/interfaces/student.model';
import { SharedModule } from '../../../shared/shared.module';

type Profile = TutorProfile | StudentProfile;

describe('PreviousTuitionsComponent', () => {
  let component: PreviousTuitionsComponent;
  let fixture: ComponentFixture<PreviousTuitionsComponent>;
  let availabilityServiceSpy: jasmine.SpyObj<AvailabilityService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    spyOn(AuthenticatedUser, 'getAuthUserProfileId').and.returnValue(321);

    availabilityServiceSpy = jasmine.createSpyObj('AvailabilityService', ['fetchTuitions']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [PreviousTuitionsComponent],
      imports:[SharedModule],
      providers: [
        { provide: AvailabilityService, useValue: availabilityServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PreviousTuitionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('calls fetchInActiveTuitions', () => {
      spyOn(component, 'fetchInActiveTuitions');
      component.ngOnInit();
      expect(component.fetchInActiveTuitions).toHaveBeenCalled();
    });
  });

  describe('fetchInActiveTuitions', () => {
    const mockResponse = { content: [{ id: 1 }, { id: 2 }], totalElements: 2 } as any;

    it('loads profiles successfully and sets state', () => {
      availabilityServiceSpy.fetchTuitions.and.returnValue(of(mockResponse));
      component.isLoading = false;
      component.profiles = [];
      component.totalElements = 0;

      component.fetchInActiveTuitions();

      expect(AuthenticatedUser.getAuthUserProfileId).toHaveBeenCalled();
      expect(availabilityServiceSpy.fetchTuitions)
        .toHaveBeenCalledWith(321, false, component.pageIndex, component.pageSize);
      expect(component.profiles).toEqual(mockResponse.content);
      expect(component.totalElements).toBe(2);
      expect(component.isLoading).toBeFalse();
    });

    it('handles error, logs and resets loading', () => {
      spyOn(console, 'error');
      availabilityServiceSpy.fetchTuitions.and.returnValue(throwError(() => new Error('fail')));

      component.isLoading = true;
      component.profiles = [{ id: 9 } as any];
      component.totalElements = 5;

      component.fetchInActiveTuitions();

      expect(console.error).toHaveBeenCalledWith('Error fetching profiles:', jasmine.any(Error));
      expect(component.isLoading).toBeFalse();
      // Profiles and totalElements should remain as before error
      expect(component.profiles).toEqual([{ id: 9 } as any]);
      expect(component.totalElements).toBe(5);
    });
  });

  describe('onPageChange', () => {
    it('updates pagination and refetches', () => {
      spyOn(component, 'fetchInActiveTuitions');
      const event: PageEvent = { pageIndex: 4, pageSize: 8, length: 0 };

      component.onPageChange(event);

      expect(component.pageIndex).toBe(4);
      expect(component.pageSize).toBe(8);
      expect(component.fetchInActiveTuitions).toHaveBeenCalled();
    });
  });

  describe('viewTuitionSummary', () => {
    it('navigates to the tuition summary page', () => {
      component.viewTuitionSummary(555);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/user-dashboard/tuition-summary', 555]);
    });
  });
});
