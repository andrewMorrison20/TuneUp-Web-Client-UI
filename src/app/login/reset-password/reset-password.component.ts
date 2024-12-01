import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  forgotPasswordForm: FormGroup; // Form group for the email input
  errorMessage: string | null = null; // To hold error messages

  constructor(private fb: FormBuilder) {
    // Initialize the form group
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Email field with validation
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.get('email')?.value;
      console.log('Sending password reset email to:', email);
      this.requestEmailLink(email).then(
        () => {
          alert('Password reset email sent successfully!');
          this.errorMessage = null;
        },
        (error) => {
          this.errorMessage = error;
        }
      );
    } else {
      this.errorMessage = 'Please provide a valid email address.';
    }
  }


  requestEmailLink(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'fail@example.com') {
          reject('Failed to send password reset email. Please try again.');
        } else {
          resolve();
        }
      }, 1000);
    });
  }
}
