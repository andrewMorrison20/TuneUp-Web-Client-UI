import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { ActiveTuitionsComponent } from './active-tuitions.component';
import { AvailabilityService } from '../../../lessons/availability.service';
import { TuitionsService } from '../tuitions.service';
import { AuthenticatedUser } from '../../../authentication/authenticated-user.class';
import {SharedModule} from "../../../shared/shared.module";

describe('ActiveTuitionsComponent', () => {
  let component: ActiveTuitionsComponent;
  let fixture: ComponentFixture<ActiveTuitionsComponent>;
  let tuitionsServiceSpy: jasmine.SpyObj<TuitionsService>;
  let availabilityServiceSpy: jasmine.SpyObj<AvailabilityService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    // Spy on AuthenticatedUser
    spyOn(AuthenticatedUser, 'getAuthUserProfileId').and.returnValue(777);

    tuitionsServiceSpy = jasmine.createSpyObj('TuitionsService', ['fetchTuitions']);
    availabilityServiceSpy = jasmine.createSpyObj('AvailabilityService', ['']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [ActiveTuitionsComponent],
      imports:[SharedModule],
      providers: [
        { provide: TuitionsService, useValue: tuitionsServiceSpy },
        { provide: AvailabilityService, useValue: availabilityServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveTuitionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch active tuitions', () => {
      spyOn(component, 'fetchActiveTuitions');
      component.ngOnInit();
      expect(component.fetchActiveTuitions).toHaveBeenCalled();
    });
  });

  describe('fetchActiveTuitions', () => {
    const mockResponse = { content: [{ id: 1 }], totalElements: 5 } as any;

    it('should load profiles on success', () => {
      tuitionsServiceSpy.fetchTuitions.and.returnValue(of(mockResponse));

      component.isLoading = false;
      component.profiles = [];
      component.totalElements = 0;

      component.fetchActiveTuitions();

      expect(AuthenticatedUser.getAuthUserProfileId).toHaveBeenCalled();
      expect(tuitionsServiceSpy.fetchTuitions)
        .toHaveBeenCalledWith(777, true, component.pageIndex, component.pageSize);
      expect(component.isLoading).toBeFalse();
      expect(component.profiles).toEqual(mockResponse.content);
      expect(component.totalElements).toBe(5);
    });

    it('should handle error and stop loading', () => {
      spyOn(console, 'error');
      tuitionsServiceSpy.fetchTuitions.and.returnValue(throwError(() => new Error('err')));

      component.isLoading = false;
      component.fetchActiveTuitions();

      expect(console.error).toHaveBeenCalledWith('Error fetching profiles:', jasmine.any(Error));
      expect(component.isLoading).toBeFalse();
      // ensure no mutation on profiles and totalElements
      expect(component.profiles).toEqual([]);
      expect(component.totalElements).toBe(0);
    });
  });

  describe('onPageChange', () => {
    it('should update pagination and refetch', () => {
      spyOn(component, 'fetchActiveTuitions');
      const event: PageEvent = { pageIndex: 2, pageSize: 15, length: 0 };

      component.onPageChange(event);

      expect(component.pageIndex).toBe(2);
      expect(component.pageSize).toBe(15);
      expect(component.fetchActiveTuitions).toHaveBeenCalled();
    });
  });

  describe('viewTuitionSummary', () => {
    it('should navigate to summary route', () => {
      component.viewTuitionSummary(123);
      expect(routerSpy.navigate)
        .toHaveBeenCalledWith(['/user-dashboard/tuition-summary', 123]);
    });
  });
});
