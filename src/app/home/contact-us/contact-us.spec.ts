import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ContactUsComponent } from './contact-us.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import {SharedModule} from "../../shared/shared.module";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('ContactUsComponent', () => {
  let component: ContactUsComponent;
  let fixture: ComponentFixture<ContactUsComponent>;
  let httpMock: HttpTestingController;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContactUsComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        SharedModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactUsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty fields', () => {
    const form = component.contactForm;
    expect(form).toBeTruthy();
    expect(form.get('name')?.value).toBe('');
    expect(form.get('email')?.value).toBe('');
    expect(form.get('subject')?.value).toBe('');
    expect(form.get('message')?.value).toBe('');
  });

  it('should mark form as touched if invalid on submit', () => {
    spyOn(component.contactForm, 'markAllAsTouched');
    component.onSubmit();
    expect(component.contactForm.markAllAsTouched).toHaveBeenCalled();
  });

  it('should send contact request and show success snackbar', fakeAsync(() => {
    spyOn(snackBar, 'open');

    component.contactForm.setValue({
      name: 'John',
      email: 'john@example.com',
      subject: 'Subject',
      message: 'Test message'
    });

    component.onSubmit();

    const req = httpMock.expectOne(`${environment.apiUrl}/email/contact`);
    expect(req.request.method).toBe('POST');
    req.flush('Message sent');

    tick();

    expect(snackBar.open).toHaveBeenCalledWith('Your message has been sent.', 'Close', { duration: 3000 });
    expect(component.isSubmitting).toBeFalse();
  }));

  it('should show error snackbar on HTTP failure', fakeAsync(() => {
    spyOn(snackBar, 'open');

    component.contactForm.setValue({
      name: 'Jane',
      email: 'jane@example.com',
      subject: 'Subject',
      message: 'Another test message'
    });

    component.onSubmit();

    const req = httpMock.expectOne(`${environment.apiUrl}/email/contact`);
    req.flush('Error occurred', { status: 500, statusText: 'Server Error' });

    tick();

    expect(snackBar.open).toHaveBeenCalledWith('Failed to send message. Please try again.', 'Close', { duration: 3000 });
    expect(component.isSubmitting).toBeFalse();
  }));
});
