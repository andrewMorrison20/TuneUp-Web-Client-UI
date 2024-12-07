import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountResponse, AccountSettingsService } from './account-settings.service';
import { AuthenticatedUser } from '../authentication/authenticated-user.class';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss'],
})
export class AccountSettingsComponent {
  nameForm: FormGroup;
  emailForm: FormGroup;
  addressForm: FormGroup;
  passwordForm: FormGroup;
  accountDetails: AccountResponse | null = null;
  feedbackMessage: string | null = null;
  feedbackType: 'success' | 'error' | null = null;

  constructor(private fb: FormBuilder, private accountService: AccountSettingsService) {
    this.nameForm = this.fb.group({
      name: ['', [Validators.required]],
    });

    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.addressForm = this.fb.group({
      postcode: ['', [Validators.required]],
      addressLine1: ['', [Validators.required]],
      addressLine2: [''],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]],
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    const userId = AuthenticatedUser.getAuthUserId();
    this.accountService.getUserAccountDetails(userId).subscribe(
      (data: AccountResponse) => {
        this.accountDetails = data;
      },
      (error) => {
        this.setFeedback('Failed to fetch account details.', 'error');
        console.error('Failed to fetch account details', error);
      }
    );
  }

  private setFeedback(message: string, type: 'success' | 'error') {
    this.feedbackMessage = message;
    this.feedbackType = type;
  }

  onSubmitName(): void {
    if (this.nameForm.valid) {
      const userId = AuthenticatedUser.getAuthUserId();
      this.accountService.updateUserDetails(userId, { name: this.nameForm.value.name }).subscribe({
        next: (updatedDetails) => {
          this.accountDetails = updatedDetails;
          this.setFeedback('Name updated successfully!', 'success');
        },
        error: (err) => {
          this.setFeedback('Failed to update name. Please try again.', 'error');
          console.error('Update failed:', err);
        },
      });
    } else {
      this.setFeedback('Please ensure the name field is valid.', 'error');
    }
  }

  onSubmitEmail() {
    if (this.emailForm.valid) {
      const userId = AuthenticatedUser.getAuthUserId();
      this.accountService.updateUserDetails(userId, { email: this.emailForm.value.email }).subscribe({
        next: (updatedDetails) => {
          this.accountDetails = updatedDetails;
          this.setFeedback('Email updated successfully!', 'success');
        },
        error: (err) => {
          this.setFeedback('Failed to update email. Please try again.', 'error');
          console.error('Update failed:', err);
        },
      });
    } else {
      this.setFeedback('Please ensure the email field is valid.', 'error');
    }
  }

  onSubmitAddress() {
    if (this.addressForm.valid) {
      const userId = AuthenticatedUser.getAuthUserId();
      this.accountService.updateUserDetails(userId, {address:this.addressForm.value}).subscribe({
        next: (updatedDetails) => {
          this.accountDetails = updatedDetails;
          this.setFeedback('Address updated successfully!', 'success');
        },
        error: (err) => {
          this.setFeedback('Failed to update address. Please try again.', 'error');
          console.error('Update failed:', err);
        },
      });
    } else {
      this.setFeedback('Please ensure all address fields are valid.', 'error');
    }
  }

  onSubmitPassword() {
    if (this.passwordForm.valid) {
      const { password, confirmPassword } = this.passwordForm.value;
      const userId = AuthenticatedUser.getAuthUserId();

      if (password === confirmPassword) {
        this.accountService.updateUserDetails(userId, { password: password }).subscribe({
          next: (updatedDetails) => {
            this.accountDetails = updatedDetails;
            this.setFeedback('Password updated successfully!', 'success');
          },
          error: (err) => {
            this.setFeedback('Failed to update password. Please try again.', 'error');
            console.error('Update failed:', err);
          },
        });
      } else {
        this.setFeedback('Passwords do not match. Please try again.', 'error');
      }
    } else {
      this.setFeedback('Please ensure all password fields are valid.', 'error');
    }
  }
}
