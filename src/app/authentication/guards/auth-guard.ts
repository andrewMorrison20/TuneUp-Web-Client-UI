import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticatedUser } from '../authenticated-user.class';
/**
 * Checks if user is authorised or not, redirects to login page
 */
export const authGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  const router = inject(Router);

  if (AuthenticatedUser.userLoggedIn()) {
    const user = AuthenticatedUser.getAuthenticatedUser();
    if (user) {
      return true;
    }
  }
  // Redirect to login with returnUrl
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
