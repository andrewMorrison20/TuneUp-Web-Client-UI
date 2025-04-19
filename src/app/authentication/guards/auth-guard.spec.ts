import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {authGuard} from "./auth-guard";
import {AuthenticatedUser} from "../authenticated-user.class";


describe('authGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });

    route = {} as ActivatedRouteSnapshot;
    state = { url: '/protected' } as RouterStateSnapshot;
  });

  function runGuard(): boolean {
    return TestBed.runInInjectionContext(() => authGuard(route, state));
  }

  it('should allow navigation when user is logged in and a user object exists', () => {
    spyOn(AuthenticatedUser, 'userLoggedIn').and.returnValue(true);
    spyOn(AuthenticatedUser, 'getAuthenticatedUser').and.returnValue(
      new AuthenticatedUser('u', [], 't', '', 1, 2, '')
    );

    const result = runGuard();
    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when userLoggedIn is false', () => {
    spyOn(AuthenticatedUser, 'userLoggedIn').and.returnValue(false);
    // getAuthenticatedUser shouldn't even be called in this branch
    spyOn(AuthenticatedUser, 'getAuthenticatedUser');

    const result = runGuard();
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/login'],
      { queryParams: { returnUrl: state.url } }
    );
    expect(AuthenticatedUser.getAuthenticatedUser).not.toHaveBeenCalled();
  });

  it('should redirect to login when userLoggedIn is true but no user object', () => {
    spyOn(AuthenticatedUser, 'userLoggedIn').and.returnValue(true);
    spyOn(AuthenticatedUser, 'getAuthenticatedUser').and.returnValue(null);

    const result = runGuard();
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/login'],
      { queryParams: { returnUrl: state.url } }
    );
  });
});
