import {Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  apiUrl = environment.apiUrl

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.http.post(`${this.apiUrl}/email/contact`, this.contactForm.value,{ responseType: 'text' }).subscribe({
      next: () => {
        this.snackBar.open('Your message has been sent.', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.snackBar.open('Failed to send message. Please try again.', 'Close', { duration: 3000 });
        console.error('Contact form error:', err);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}
