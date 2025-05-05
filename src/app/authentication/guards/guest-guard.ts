import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticatedUser } from '../authenticated-user.class';

/**
 * Ensure user is not authed
 */
export const guestGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  const router = inject(Router);

  if (AuthenticatedUser.userLoggedIn()) {
    // Redirect logged-in users to home
    router.navigate(['/home']);
    return false;
  }

  return true; // Allow access for guests (non-logged-in users)
};
