/*import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {ActivatedRoute, Router} from '@angular/router';
import { DebugElement } from '@angular/core';
import {NavModule} from "../components/nav/nav.module";
import {SharedModule} from "../shared/shared.module";


describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let debugElement: DebugElement;
  const activatedRouteStub = {
    snapshot: { params: {} },
    queryParams: { subscribe: () => {} }
  };

  beforeEach(async () => {
    // Create a spy for the Router
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ SignupComponent ],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        NavModule,
        SharedModule
      ],
      providers: [
        { provide: Router, useValue: spy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
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
    // Arrange: fill out the form with mismatching passwords
    component.signupForm.setValue({
      email: 'test@example.com',
      password: 'password1',
      confirmPassword: 'password2',
      name: 'Test User',
      accountType: 'student'
    });

    // Act: call onSignup
    component.onSignup();

    // Assert: error message should be set and no HTTP call should be made
    expect(component.errorMessage).toBe('Passwords do not match');
  });

  it('should send a signup request when form is valid and passwords match', fakeAsync(() => {
    // Arrange: Fill out the form with valid data
    component.signupForm.setValue({
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password',
      name: 'Test User',
      accountType: 'student'
    });

    // Act: call onSignup()
    component.onSignup();

    // isLoading should be true before the HTTP response is received
    expect(component.isLoading).toBeTrue();

    // Expect an HTTP request to the signup endpoint.
    const req = httpMock.expectOne(req =>
      req.method === 'POST' &&
      req.url.includes('http://localhost:8080/api/users/createNew')
    );
    expect(req.request.body).toEqual({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password'
    });

    // Simulate a successful response.
    req.flush({ success: true });
    tick(1000); // Simulate the 1-second delay before redirect

    // Assert: Check success message and that the router.navigate was called.
    expect(component.isLoading).toBeFalse();
    expect(component.successMessage).toBe('Signup successful! Please log in.');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    flush();
  }));

  it('should display an error message when signup fails with 409 status', fakeAsync(() => {
    // Arrange: Fill out the form with valid data.
    component.signupForm.setValue({
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password',
      name: 'Test User',
      accountType: 'student'
    });

    // Act: call onSignup()
    component.onSignup();
    const req = httpMock.expectOne(req => req.method === 'POST');
    // Simulate a 409 Conflict error.
    req.flush({ message: 'Conflict' }, { status: 409, statusText: 'Conflict' });
    tick();

    // Assert: error message should be set.
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Email already exists. Please use a different email.');
    flush();
  }));
});*/
