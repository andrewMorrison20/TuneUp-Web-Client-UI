import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss'],
})
export class UpdatePasswordComponent implements OnInit {
  updatePasswordForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    // Initialize the form group
    this.updatePasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatch } // Add custom validator
    );
  }

  ngOnInit() {

    this.token = this.route.snapshot.queryParamMap.get('token');
  }


  passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  onSubmit() {
    if (this.updatePasswordForm.valid) {
      const password = this.updatePasswordForm.get('password')?.value;

      this.updatePassword(password).subscribe({
        next: (response) => {
          console.log(response);
          this.successMessage = response.message || 'Password reset successfully.';
          this.errorMessage = null;
        },
        error: (err) => {
          // Handle error response
          this.errorMessage = err.error.message || 'Failed to reset password.';
          this.successMessage = null;
        },
      });
    } else {
      this.errorMessage = 'Please ensure the form is valid.';
      this.successMessage = null;
    }
  }

  updatePassword(password: string) {
    const url = 'http://localhost:8080/api/users/updatePassword';
    return this.http.post<{ message: string }>(url, { token: this.token, password: password });
  }
}
