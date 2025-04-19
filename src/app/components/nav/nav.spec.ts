import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NavComponent } from './nav.component';
import { Router } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, Subject } from 'rxjs';
import { AuthenticatedUser } from '../../authentication/authenticated-user.class';
import {SharedModule} from "../../shared/shared.module";

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let wsSubject: Subject<any>;
  let wsServiceStub: any;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    // Stub AuthenticatedUser static methods
    spyOn(AuthenticatedUser, 'userLoggedIn').and.returnValue(true);
    spyOn(AuthenticatedUser, 'getAuthUserId').and.returnValue(42);
    spyOn(AuthenticatedUser, 'deleteObj');

    wsSubject = new Subject();
    wsServiceStub = {
      subscribeToNotifications: jasmine.createSpy('subscribeToNotifications').and.returnValue(wsSubject.asObservable())
    };

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SharedModule],
      declarations: [NavComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: WebsocketService, useValue: wsServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('toggleMenu toggles isCollapsed', () => {
    expect(component.isCollapsed).toBeTrue();
    component.toggleMenu();
    expect(component.isCollapsed).toBeFalse();
    component.toggleMenu();
    expect(component.isCollapsed).toBeTrue();
  });

  it('logout calls deleteObj and navigates to login', () => {
    component.logout();
    expect(AuthenticatedUser.deleteObj).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('mergeNotifications merges and sorts descending', () => {
    const existing = [ { id:1, type:'', message:'', read:false } ];
    const incoming = [ { id:2, type:'', message:'', read:true }, { id:1, type:'', message:'dup', read:true } ];
    const merged = component.mergeNotifications(existing as any, incoming as any);
    // Should have ids 2 then 1, and id 1 from incoming
    expect(merged).toEqual([
      jasmine.objectContaining({ id:2 }),
      jasmine.objectContaining({ id:1, message:'dup', read:true })
    ]);
  });

  it('updateUnreadCount counts unreadd correctly', () => {
    component.notifications = [
      { id:1, type:'', message:'', read:false },
      { id:2, type:'', message:'', read:true },
      { id:3, type:'', message:'', read:false }
    ];
    component.updateUnreadCount();
    expect(component.unreadCount).toBe(2);
  });

  it('ngOnInit loads unread and subscribes websocket', fakeAsync(() => {
    const initial: any[] = [ { id:5, type:'', message:'m', read:false } ];
    // trigger ngOnInit
    component.ngOnInit();
    // expect HTTP get
    const req = httpMock.expectOne('http://localhost:8080/api/notifications/unread/42');
    expect(req.request.method).toBe('GET');
    req.flush(initial);
    // after flush
    tick();
    expect(component.notifications.length).toBe(1);
    expect(component.unreadCount).toBe(1);
    // trigger websocket notification
    wsSubject.next({ id:6, type:'', message:'w', read:false });
    tick();
    expect(component.notifications.find(n=>n.id===6)).toBeDefined();
    expect(component.unreadCount).toBe(2);
  }));

  it('ngOnDestroy unsubscribes subscription', () => {
    component.notificationSubscription = wsSubject.subscribe();
    spyOn(component.notificationSubscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.notificationSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('markNotificationAsRead calls post and updates', fakeAsync(() => {
    // Set up one unread
    const note = { id:7, type:'', message:'', read:false };
    component.notifications = [note];
    component.unreadCount = 1;
    component.markNotificationAsRead(note as any);
    const req = httpMock.expectOne('http://localhost:8080/api/notifications/7/mark-read');
    expect(req.request.method).toBe('POST');
    req.flush({});
    tick();
    expect(note.read).toBeTrue();
    expect(component.unreadCount).toBe(0);
  }));
});
