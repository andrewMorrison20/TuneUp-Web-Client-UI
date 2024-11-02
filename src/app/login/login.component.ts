import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(private fb: FormBuilder) {
    // Initialize the form in the constructor
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Any additional initialization can be done here if needed
    // For example, resetting the form if navigating back to this component
    this.loginForm.reset();
  }

  // Social login methods
  loginWithGoogle() {
    console.log('Login with Google');
    // Implement Google login logic here
  }

  loginWithFacebook() {
    console.log('Login with Facebook');
    // Implement Facebook login logic here
  }

  loginWithOutlook() {
    console.log('Login with Outlook');
    // Implement Outlook login logic here
  }

  onLogin() {
    if (this.loginForm.valid) {
      console.log('Login successful', this.loginForm.value);
      // Handle the login process
    }
  }
}

