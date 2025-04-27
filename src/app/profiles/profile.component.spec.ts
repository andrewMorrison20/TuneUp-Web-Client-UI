import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { of, Subject } from 'rxjs';
import { ProfileService } from './profile.service';
import { AvailabilityService } from '../lessons/availability.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ChatDialogueComponent } from '../user-dashboard/chats/chat-dialogue.component';


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
    spyOnProperty(window, 'innerWidth').and.returnValue(1024);
    // depending on your test environment window.innerWidth is > 768
    expect(component.calendarOptions.initialView).toBe('dayGridMonth');
    expect(component.calendarOptions.plugins!.length).toBe(3);
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
    routeParamSubject.next(new Map([['id', '10']]) as any);
    tick();

    expect(component.profile).toEqual(mockProfile);
    expect(component.profile!.reviews).toEqual(mockReviews);
    expect(component.availabilitySlots).toEqual(mockSlots);
    expect((component.calendarOptions.events as any[]).length).toBe(1);
  }));

  it('onDateClick switches to timeGridDay view', () => {
    const api = { changeView: jasmine.createSpy() };
    (component as any).calendarComponent = { getApi: () => api };

    component.onDateClick({ dateStr: '2025-04-20' });
    expect(api.changeView).toHaveBeenCalledWith('timeGridDay', '2025-04-20');
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

  it('startChat calls openChatDialog', () => {
    component.profile = { displayName: 'Bob', id: 1, profileType: 'Tutor', reviews: [], instruments: [], lessonType: '', prices: [] } as any;
    spyOn<any>(component, 'openChatDialog');
    component.startChat();
    expect((component as any).openChatDialog).toHaveBeenCalled();
  });

  describe('openChatDialog', () => {
    it('opens dialog with correct data', () => {
      component.profile = { id: 2 } as any;
      const dialogRef = { afterClosed: () => of(null) } as any;
      dialogSpy.open.and.returnValue(dialogRef);

      (component as any).openChatDialog();
      expect(dialogSpy.open).toHaveBeenCalledWith(
        ChatDialogueComponent,
        jasmine.objectContaining({
          data: { conversation: null, participantId: 2, userProfileId: jasmine.any(Number) }
        })
      );
    });
  });

  describe('windowResize callback', () => {
    let apiSpy: jasmine.SpyObj<{ changeView(viewName: string): void }>;
    let viewObj: any;

    beforeEach(() => {
      component.ngOnInit(); // ensure calendarOptions is set
      apiSpy = jasmine.createSpyObj('calendarApi', ['changeView']);
      viewObj = { calendar: apiSpy };
    });

    it('switches to timeGridDay when width < 768', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(500);
      (component.calendarOptions.windowResize as any)({ view: viewObj });
      expect(apiSpy.changeView).toHaveBeenCalledWith('timeGridDay');
    });

    it('switches to dayGridMonth when width >= 768', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(1024);
      (component.calendarOptions.windowResize as any)({ view: viewObj });
      expect(apiSpy.changeView).toHaveBeenCalledWith('dayGridMonth');
    });
  });

  it('isPricesMapNotEmpty returns correct boolean', () => {
    component.profile = { profileType: 'Tutor', prices: [ { amount: 10 } ] } as any;
    expect(component.isPricesMapNotEmpty()).toBeTrue();
    component.profile = { profileType: 'Tutor', prices: [] } as any;
    expect(component.isPricesMapNotEmpty()).toBeFalse();
    component.profile = { profileType: 'Student', prices: [ { amount: 5 } ] } as any;
    expect(component.isPricesMapNotEmpty()).toBeFalse();
  });

  describe('eventDidMount styling', () => {
    let info: any;
    let fakeEl: HTMLElement;

    beforeEach(() => {
      component.ngOnInit();
      fakeEl = document.createElement('div');
      const timeSpan = document.createElement('span');
      timeSpan.className = 'fc-event-time';
      fakeEl.appendChild(timeSpan);
      info = { el: fakeEl, event: { extendedProps: { status: '' } } };
    });

    it('should color grey for BOOKED', () => {
      info.event.extendedProps.status = 'BOOKED';
      (component.calendarOptions.eventDidMount as any)(info);
      expect((info.el.querySelector('.fc-event-time') as HTMLElement).style.color).toBe('grey');
    });

    it('should default color for other statuses', () => {
      info.event.extendedProps.status = 'AVAILABLE';
      (component.calendarOptions.eventDidMount as any)(info);
      expect((info.el.querySelector('.fc-event-time') as HTMLElement).style.color).toBe('inherit');
    });
  });
});
