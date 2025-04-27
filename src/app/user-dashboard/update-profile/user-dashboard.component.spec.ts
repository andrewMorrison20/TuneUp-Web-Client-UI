import { ComponentFixture, TestBed } from '@angular/core/testing';
import {UserDashboardComponent} from "../user-dashboard.component";
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";
import {UserDashboardModule} from "../user-dashboard.module";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {ActivatedRoute} from "@angular/router";


describe('UserDashboardComponent', () => {
  let component: UserDashboardComponent;
  let fixture: ComponentFixture<UserDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDashboardModule, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: {} }, queryParams: {} } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set isDesktopView correctly on init', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(1024);
    component.ngOnInit();
    expect(component.isDesktopView).toBeTrue();
  });

  it('should update view on resize below threshold', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(500);
    component.onResize();
    expect(component.isDesktopView).toBeFalse();
  });

  it('should return true if user is tutor', () => {
    spyOn(AuthenticatedUser, 'getAuthUserProfileType').and.returnValue('TUTOR');
    expect(component.isTutorProfile()).toBeTrue();
  });

  it('should return false if user is student', () => {
    spyOn(AuthenticatedUser, 'getAuthUserProfileType').and.returnValue('student');
    expect(component.isTutorProfile()).toBeFalse();
  });

  it('should return dashboard title with user name', () => {
    spyOn(AuthenticatedUser, 'getAuthUserName').and.returnValue('Alice');
    expect(component.getDashboardTitle()).toBe("Alice's Dashboard");
  });
});
