import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {SharedModule} from "../shared/shared.module";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";


describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, SharedModule, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: { returnUrl: '/dashboard' }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set returnUrl on init', () => {
    expect(component.returnUrl).toBe('/dashboard');
  });

  it('should not submit invalid form', () => {
    component.loginForm.setValue({ email: '', password: '' });
    component.onLogin();
    expect(component.errorMessage).toBe('');
  });

  it('should call login API and navigate on success', fakeAsync(() => {
    const tokenPayload = {
      name: 'Test User',
      roles: ['USER'],
      userId: 1,
      profileId: 2,
      profileType: 'STUDENT'
    };
    const token = btoa(JSON.stringify({})) + '.' + btoa(JSON.stringify(tokenPayload)) + '.signature';

    component.loginForm.setValue({ email: 'test@example.com', password: 'pass123' });

    component.onLogin();

    const req = httpMock.expectOne('http://localhost:8080/auth/login');
    req.flush({ token });
    tick();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  }));

  it('should show error message on 400 error', () => {
    component.loginForm.setValue({ email: 'test@example.com', password: 'y' });
    component.onLogin();

    const req = httpMock.expectOne('http://localhost:8080/auth/login');
    req.flush({}, { status: 400, statusText: 'Bad Request' });

    expect(component.errorMessage).toBe('Invalid email or password.');
  });


  it('should log and decode invalid JWT', () => {
    const invalidToken = 'bad.token.structure';
    const result = (component as any).decodeJWT(invalidToken);
    expect(result).toBeNull();
  });

  it('should show error message on 500 error', () => {
    component.loginForm.setValue({ email: 'test@example.com', password: 'y' });
    component.onLogin();
    const req = httpMock.expectOne('http://localhost:8080/auth/login');
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });
    expect(component.errorMessage).toBe('Server error. Please try again later.');
  });

  it('should show message from 403 error', () => {
    component.loginForm.setValue({ email: 'test@example.com', password: 'y' });
    component.onLogin();
    const req = httpMock.expectOne('http://localhost:8080/auth/login');
    req.flush({ message: 'Access denied' }, { status: 403, statusText: 'Forbidden' });
    expect(component.errorMessage).toBe('Access denied');
  });

  it('should send verification link if email exists', () => {
    component.loginForm.get('email')?.setValue('test@example.com');
    component.requestVerificationLink();
    const req = httpMock.expectOne('http://localhost:8080/api/users/requestVerification');
    req.flush({});
    expect(req.request.method).toBe('POST');
  });

  it('should not send verification link if email is empty', () => {
    spyOn(console, 'error');
    component.requestVerificationLink();
    expect(console.error).toHaveBeenCalledWith('Email is required to request verification');
  });

  it('should log social login methods', () => {
    spyOn(console, 'log');
    component.loginWithGoogle();
    expect(console.log).toHaveBeenCalledWith('Login with Google');

    component.loginWithFacebook();
    expect(console.log).toHaveBeenCalledWith('Login with Facebook');

    component.loginWithOutlook();
    expect(console.log).toHaveBeenCalledWith('Login with Outlook');
  });
});
