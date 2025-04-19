import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { of, Subject } from 'rxjs';
import { ProfileService } from './profile.service';
import { AvailabilityService } from '../lessons/availability.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let routeParamSubject: Subject<ParamMap>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let availabilitySpy: jasmine.SpyObj<AvailabilityService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routeParamSubject = new Subject<ParamMap>();
    profileServiceSpy = jasmine.createSpyObj('ProfileService', [
      'getProfileById', 'getProfileReviews', 'getProfileQualificationsById'
    ]);
    availabilitySpy = jasmine.createSpyObj('AvailabilityService', ['getPeriodAvailabilityForProfile']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: routeParamSubject.asObservable() } },
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: AvailabilityService, useValue: availabilitySpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should initialize calendarOptions on init', () => {
    component.ngOnInit();
    expect(component.calendarOptions.initialView).toBe('dayGridMonth');
    expect(component.calendarOptions!.plugins!.length).toBe(3);
  });

  it('should fetch profile and reviews on param change', fakeAsync(() => {
    const mockProfile = { id: 10, profileType: 'Tutor', reviews: [], instruments: [], lessonType: 'online', prices: [] } as any;
    const mockReviews = [{ reviewer: 'Alice', rating: 4, title: 'Great', comment: 'Good!' }];
    const mockQuals: any[] = [];
    const mockSlots = [{ id: 5, startTime: 's', endTime: 'e', status: 'AVAILABLE' }];

    profileServiceSpy.getProfileById.and.returnValue(of(mockProfile));
    profileServiceSpy.getProfileReviews.and.returnValue(of(mockReviews));
    profileServiceSpy.getProfileQualificationsById.and.returnValue(of(mockQuals));
    availabilitySpy.getPeriodAvailabilityForProfile.and.returnValue(of(mockSlots));

    component.ngOnInit();
    routeParamSubject.next(new Map([['id', '10']]) as any);(new Map([['id', '10']]) as any);
    tick();

    expect(component.profile).toEqual(mockProfile);
    expect(component.profile!.reviews).toEqual(mockReviews);
    expect(component.availabilitySlots).toEqual(mockSlots);
    // calendarOptions.events updated
    expect((component.calendarOptions.events as any[]).length).toBe(1);
  }));

  it('onDateClick switches to timeGridDay and sets isTimeGridView', () => {
    const api = { changeView: jasmine.createSpy() };
    (component as any).calendarComponent = { getApi: () => api };

    component.onDateClick({ dateStr: '2025-04-20' });
    expect(api.changeView).toHaveBeenCalledWith('timeGridDay', '2025-04-20');
    expect(component.isTimeGridView).toBeTrue();
  });

  it('switchToMonthView switches back to dayGridMonth', () => {
    const api = { changeView: jasmine.createSpy() };
    (component as any).calendarComponent = { getApi: () => api };
    component.isTimeGridView = true;
    component.switchToMonthView();
    expect(api.changeView).toHaveBeenCalledWith('dayGridMonth');
    expect(component.isTimeGridView).toBeFalse();
  });

  it('getEventColor returns correct colors', () => {
    expect((component as any).getEventColor('AVAILABLE')).toBe('#4CAF50');
    expect((component as any).getEventColor('PENDING')).toBe('#9E9E9E');
    expect((component as any).getEventColor('BOOKED')).toBe('#FF0000');
    expect((component as any).getEventColor('OTHER')).toBe('#000000');
  });

  it('isTutorProfile type guard works', () => {
    const tutor = { profileType: 'Tutor' } as any;
    const student = { profileType: 'Student' } as any;
    expect(component.isTutorProfile(tutor)).toBeTrue();
    expect(component.isTutorProfile(student)).toBeFalse();
  });

  it('goBackToResults navigates to search', () => {
    component.goBackToResults();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/profiles/search']);
  });
});
