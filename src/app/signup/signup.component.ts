import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  errorMessage='';
  successMessage='';
  isLoading = false;

  constructor(private fb: FormBuilder,private http: HttpClient) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onSignup() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.signupForm.valid) {
      const formData = this.signupForm.value;

      if(formData.password !== formData.confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        return;
      }

      this.isLoading = true;

      const apiUrl = 'http://localhost:8080/api/users/createNew';
      this.http.post(apiUrl,{
        email: formData.email,
        password:formData.password}).subscribe(
          response =>{
            this.isLoading = false;
            this.successMessage = 'Signup successful! Please check your email to verify your account.';
            console.log('User Creation Successful', response)
          },
        (error: HttpErrorResponse) => {
          this.isLoading = false;
          if (error.status === 400) {
            this.errorMessage = 'Invalid request. Please check your details.';
          } else if (error.status === 409) {
            this.errorMessage = 'Email already exists. Please use a different email.';
          } else if (error.status === 500) {
            this.errorMessage = 'Server error. Please try again later.';
          } else {
            this.errorMessage = 'An unexpected error occurred. Please try again.';
          }

            console.error('Signup failed',error)
        })}
      else {
        this.errorMessage = 'Please fill out the form correctly.';
      console.log('Signup successful', this.signupForm.value);
    }
  }
}
