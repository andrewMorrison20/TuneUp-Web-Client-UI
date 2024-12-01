import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {AuthenticatedUser} from "./authenticated-user.class";

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    if (AuthenticatedUser.userLoggedIn()) {
      const user = AuthenticatedUser.getAuthenticatedUser();
      if (user) {
        // Redirect based on the console type (e.g., user, admin)
        if (user.forAdminConsole()) {
          this.router.navigate(['/adminDashboard']);
          return false;
        } else {
          // Allow access to account settings
          return true;
        }
      }
    }
    this.router.navigate(['/login']);
    return false;
  }
}
