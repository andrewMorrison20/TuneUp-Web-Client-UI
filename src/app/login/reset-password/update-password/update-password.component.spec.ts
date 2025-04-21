import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UpdatePasswordComponent } from './update-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import {LoginModule} from "../../login.module";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('UpdatePasswordComponent', () => {
  let component: UpdatePasswordComponent;
  let fixture: ComponentFixture<UpdatePasswordComponent>;
  let httpMock: HttpTestingController;

  const mockToken = 'mock-token';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule,LoginModule, NoopAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'token' ? mockToken : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatePasswordComponent);
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

  it('should retrieve token from route on init', () => {
    expect(component.token).toBe(mockToken);
  });

  it('should initialize form with empty values', () => {
    expect(component.updatePasswordForm.value).toEqual({
      password: '',
      confirmPassword: '',
    });
  });

  it('should validate that passwords match', () => {
    component.updatePasswordForm.setValue({
      password: '12345678',
      confirmPassword: '12345678',
    });

    expect(component.updatePasswordForm.valid).toBeTrue();
    expect(component.updatePasswordForm.errors).toBeNull();
  });

  it('should invalidate form if passwords do not match', () => {
    component.updatePasswordForm.setValue({
      password: '12345678',
      confirmPassword: '87654321',
    });

    expect(component.updatePasswordForm.errors).toEqual({ passwordsMismatch: true });
    expect(component.updatePasswordForm.valid).toBeFalse();
  });

  it('should set error message if form is invalid on submit', () => {
    component.updatePasswordForm.setValue({
      password: '123',
      confirmPassword: '123',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Please ensure the form is valid.');
    expect(component.successMessage).toBeNull();
  });

  it('should call API and show success message on valid form', fakeAsync(() => {
    component.updatePasswordForm.setValue({
      password: 'validPassword',
      confirmPassword: 'validPassword',
    });

    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:8080/api/users/updatePassword');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      token: mockToken,
      password: 'validPassword',
    });

    req.flush({ message: 'Password updated!' });
    tick();

    expect(component.successMessage).toBe('Password updated!');
    expect(component.errorMessage).toBeNull();
  }));

  it('should show fallback success message if message not returned', fakeAsync(() => {
    component.updatePasswordForm.setValue({
      password: 'validPassword',
      confirmPassword: 'validPassword',
    });

    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:8080/api/users/updatePassword');
    req.flush({});
    tick();

    expect(component.successMessage).toBe('Password reset successfully.');
    expect(component.errorMessage).toBeNull();
  }));

  it('should show error message if request fails', fakeAsync(() => {
    component.updatePasswordForm.setValue({
      password: 'validPassword',
      confirmPassword: 'validPassword',
    });

    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:8080/api/users/updatePassword');
    req.flush({ message: 'Token expired' }, { status: 400, statusText: 'Bad Request' });
    tick();

    expect(component.errorMessage).toBe('Token expired');
    expect(component.successMessage).toBeNull();
  }));

  it('should show default error if no message is returned from backend', fakeAsync(() => {
    component.updatePasswordForm.setValue({
      password: 'validPassword',
      confirmPassword: 'validPassword',
    });

    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:8080/api/users/updatePassword');
    req.flush({}, { status: 500, statusText: 'Server Error' });
    tick();

    expect(component.errorMessage).toBe('Failed to reset password.');
    expect(component.successMessage).toBeNull();
  }));
});
