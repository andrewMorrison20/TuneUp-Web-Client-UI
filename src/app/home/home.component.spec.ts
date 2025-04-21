import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeModule } from './home.module';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let innerWidthSpy: jasmine.Spy;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HomeModule, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
            snapshot: {
              paramMap: {
                get: () => null
              },
              queryParamMap: {
                get: () => null
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (innerWidthSpy) {
      innerWidthSpy.and.callThrough(); // Restore native behavior
    }
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize searchBannerExpanded to false', () => {
    expect(component.searchBannerExpanded).toBeFalse();
  });

  it('should initialize isMobile to false', () => {
    expect(component.isMobile).toBeFalse();
  });

  it('should toggle searchBannerExpanded', () => {
    expect(component.searchBannerExpanded).toBeFalse();
    component.toggleSearchBanner();
    expect(component.searchBannerExpanded).toBeTrue();
    component.toggleSearchBanner();
    expect(component.searchBannerExpanded).toBeFalse();
  });

  it('should navigate to quiz onTakeQuiz', () => {
    component.onTakeQuiz();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/quiz']);
  });

  it('should set isMobile true if screen width is below 768', () => {
    innerWidthSpy = spyOnProperty(window, 'innerWidth', 'get').and.returnValue(500);
    component.checkScreenSize();
    expect(component.isMobile).toBeTrue();
  });

  it('should set isMobile false if screen width is above 768', () => {
    innerWidthSpy = spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1024);
    component.checkScreenSize();
    expect(component.isMobile).toBeFalse();
  });
});
