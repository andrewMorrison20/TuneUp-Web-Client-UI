import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticatedUser } from '../authenticated-user.class';

export const adminGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  const router = inject(Router);

  if (AuthenticatedUser.userLoggedIn()) {
    if (AuthenticatedUser.currentUserAuthenticatedForAdmin()) {
      return true;
    }

    router.navigate(['/user-dashboard']);
    return false;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
