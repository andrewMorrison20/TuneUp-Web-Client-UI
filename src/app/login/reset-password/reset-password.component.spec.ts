import { ResetPasswordComponent } from './reset-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoginModule } from '../login.module';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, LoginModule, NoopAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty email control', () => {
    expect(component.forgotPasswordForm.get('email')?.value).toBe('');
  });

  it('should set error message if form is invalid on submit', () => {
    component.forgotPasswordForm.setValue({ email: '' });
    component.onSubmit();
    expect(component.errorMessage).toBe('Please provide a valid email address.');
  });

  it('should send request and alert success if form is valid', () => {
    spyOn(window, 'alert');
    component.forgotPasswordForm.setValue({ email: 'test@example.com' });
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:8080/api/users/requestResetPasswordEmail');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com' });

    req.flush({});
    expect(window.alert).toHaveBeenCalledWith('Password Reset Email sent successfully.');
    expect(component.errorMessage).toBeNull();
  });

  it('should set error message on request failure', () => {
    component.forgotPasswordForm.setValue({ email: 'fail@example.com' });
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:8080/api/users/requestResetPasswordEmail');
    req.flush({ message: 'Email not found' }, { status: 404, statusText: 'Not Found' });

    expect(component.errorMessage).toBe('Email not found');
  });

  it('should fallback to generic error message if error.message not present', () => {
    component.forgotPasswordForm.setValue({ email: 'fail@example.com' });
    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:8080/api/users/requestResetPasswordEmail');
    req.flush({}, { status: 500, statusText: 'Server Error' });

    expect(component.errorMessage).toBe('Failed to send password reset email.');
  });
});
