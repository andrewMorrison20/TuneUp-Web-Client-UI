import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
    // Initialize individual forms
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

  // Handlers for each section
  onSubmitName() {
    if (this.nameForm.valid) {
      console.log('Name updated:', this.nameForm.value);
    }
  }

  onSubmitEmail() {
    if (this.emailForm.valid) {
      console.log('Email updated:', this.emailForm.value);
    }
  }

  onSubmitAddress() {
    if (this.addressForm.valid) {
      console.log('Address updated:', this.addressForm.value);
    }
  }

  onSubmitPassword() {
    if (this.passwordForm.valid) {
      const { password, confirmPassword } = this.passwordForm.value;
      if (password === confirmPassword) {
        console.log('Password updated:', password);
      } else {
        console.error('Passwords do not match.');
      }
    }
  }
}
