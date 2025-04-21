import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminDashboardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set isDesktopView to true if window width > 768 on init', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(1024);
    component.ngOnInit();
    expect(component.isDesktopView).toBeTrue();
  });

  it('should set isDesktopView to false if window width <= 768 on init', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(600);
    component.ngOnInit();
    expect(component.isDesktopView).toBeFalse();
  });

  it('should update isDesktopView on window resize (above 768)', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(900);
    component.onResize();
    expect(component.isDesktopView).toBeTrue();
  });

  it('should update isDesktopView on window resize (below 768)', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(500);
    component.onResize();
    expect(component.isDesktopView).toBeFalse();
  });

  it('should toggle sidenav', () => {
    const sidenavMock = { toggle: jasmine.createSpy('toggle') };
    component.toggleSidenav(sidenavMock);
    expect(sidenavMock.toggle).toHaveBeenCalled();
  });
});
