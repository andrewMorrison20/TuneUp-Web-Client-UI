import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Routes} from "@angular/router";
import {SearchResultsComponent} from "../profiles/search-results/search-results.component";
import {ProfileComponent} from "../profiles/profile.component";

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss'],
})

export class AccountSettingsComponent {
  settingsForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.settingsForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      password: [''],
      confirmPassword: [''],
    });
  }

  onSubmit() {
    if (this.settingsForm.valid) {
      console.log('Form Data:', this.settingsForm.value);
    } else {
      console.log('Form is invalid');
    }
  }
}
