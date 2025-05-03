import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Component({
  selector: 'app-email-verification',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class EmailVerificationComponent implements OnInit {
  isLoading = true;
  message = '';
  apiUrl = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Extract the token from the query parameters
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      // Call the backend to verify the email
      this.verifyEmail(token).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.message = 'Your email has been verified. You may now log in.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 5000);
        },
        error: (err) => {
          this.isLoading = false;
          this.message = 'Email verification failed. Please try again or contact support.';
          console.error('Verification error:', err);
        }
      });
    } else {
      this.isLoading = false;
      this.message = 'No verification token provided.';
    }
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/verify-email?token=${token}`, { responseType: 'text' });
  }

}
