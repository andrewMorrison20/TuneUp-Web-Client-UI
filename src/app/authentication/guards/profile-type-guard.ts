import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticatedUser } from '../authenticated-user.class';

/**
 * Ensure profile is of correct type, redirects unauthed users
 */
export const profileTypeGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  const router = inject(Router);
  const expectedProfileType = route.data['expectedProfileType'];

  const user = AuthenticatedUser.getAuthenticatedUser();
  if (user && user.profileType?.toLowerCase() === expectedProfileType.toLowerCase()) {
    return true;
  }

  //Redirect unauthorized users
  router.navigate(['/user-dashboard']);
  return false;
};


