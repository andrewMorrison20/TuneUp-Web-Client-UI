import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EmailVerificationComponent } from './verify-email.component';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";

describe('EmailVerificationComponent', () => {
  let component: EmailVerificationComponent;
  let fixture: ComponentFixture<EmailVerificationComponent>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [EmailVerificationComponent],
      imports: [HttpClientTestingModule, RouterModule.forRoot([])],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => key === 'token' ? 'dummy-token' : null
              }
            }
          }
        },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    TestBed.overrideComponent(EmailVerificationComponent, {
      set: { template: '' }
    });

    fixture = TestBed.createComponent(EmailVerificationComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should verify email successfully and navigate after delay', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/users/verify-email?token=dummy-token`);
    expect(req.request.method).toBe('GET');
    req.flush('Success');

    expect(component.isLoading).toBeFalse();
    expect(component.message).toContain('Your email has been verified');

    tick(7000); // simulate timeout
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should handle verification error', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/users/verify-email?token=dummy-token`);
    req.flush('Error', { status: 400, statusText: 'Bad Request' });

    expect(component.isLoading).toBeFalse();
    expect(component.message).toContain('Email verification failed');
  });
});
