import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  forgotPasswordForm: FormGroup;
  errorMessage: string | null = null;
  private readonly baseUrl = environment.apiUrl

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.get('email')?.value;
      console.log('Sending password reset email to:', email);

      this.requestEmailLink(email).subscribe({
        next: () => {
          alert('Password Reset Email sent successfully.');
          this.errorMessage = null;
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Failed to send password reset email.';
        },
      });
    } else {
      this.errorMessage = 'Please provide a valid email address.';
    }
  }

  requestEmailLink(email: string) {
    const url =  this.baseUrl + '/users/requestResetPasswordEmail';
    return this.http.post(url, { email });
  }
}
