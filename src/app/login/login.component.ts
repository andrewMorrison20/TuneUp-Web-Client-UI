import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  // Move the login functions outside of the constructor
  loginWithGoogle() {
    // Implement Google login logic here
    console.log('Login with Google');
  }

  loginWithFacebook() {
    // Implement Facebook login logic here
    console.log('Login with Facebook');
  }

  loginWithOutlook() {
    // Implement Outlook login logic here
    console.log('Login with Outlook');
  }

  onLogin() {
    if (this.loginForm.valid) {
      // Handle login
      console.log('Login successful', this.loginForm.value);
    }
  }
}

