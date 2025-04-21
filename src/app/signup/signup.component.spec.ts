import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NavModule } from '../components/nav/nav.module';
import { SharedModule } from '../shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [SignupComponent],
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NavModule,
        SharedModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {} },
            queryParams: { subscribe: () => {} }
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the signup component', () => {
    expect(component).toBeTruthy();
  });

  it('should display an error message when passwords do not match', () => {
    component.signupForm.setValue({
      email: 'test@example.com',
      password: 'password1',
      confirmPassword: 'password2',
      name: 'Test User',
      accountType: 'student'
    });

    component.onSignup();

    expect(component.errorMessage).toBe('Passwords do not match');
  });

  it('should send a signup request when form is valid and passwords match', fakeAsync(() => {
    component.signupForm.setValue({
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password',
      name: 'Test User',
      accountType: 'student'
    });

    component.onSignup();
    expect(component.isLoading).toBeTrue();

    const req = httpMock.expectOne(req =>
      req.method === 'POST' && req.url.includes('http://localhost:8080/api/users/createNew')
    );
    expect(req.request.body).toEqual({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password'
    });

    req.flush({ success: true });
    tick(1000); // Simulate delay
    flush();

    expect(component.isLoading).toBeFalse();
    expect(component.successMessage).toBe('Signup successful! Please check your email to verify your account.');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should display an error message when signup fails with 409 status', fakeAsync(() => {
    component.signupForm.setValue({
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password',
      name: 'Test User',
      accountType: 'student'
    });

    component.onSignup();
    const req = httpMock.expectOne(req => req.method === 'POST');
    req.flush({ message: 'Conflict' }, { status: 409, statusText: 'Conflict' });
    tick();
    flush();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Email already exists. Please use a different email.');
  }));
});
