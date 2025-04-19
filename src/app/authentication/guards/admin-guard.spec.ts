import { TestBed } from '@angular/core/testing';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
import {adminGuard} from "./admin-guard";
import {AuthenticatedUser} from "../authenticated-user.class";


describe('adminGuard', () => {
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

    // minimal stubs for the parameters
    route = {} as ActivatedRouteSnapshot;
    state = { url: '/admin' } as RouterStateSnapshot;
  });

  function runGuard(): boolean {
    // since adminGuard calls `inject(Router)`, we run it in TestBed's injection context
    return TestBed.runInInjectionContext(() => adminGuard(route, state));
  }

  it('redirects to /login when not logged in', () => {
    spyOn(AuthenticatedUser, 'userLoggedIn').and.returnValue(false);
    const allowed = runGuard();

    expect(allowed).toBeFalse();
    expect(routerSpy.navigate)
      .toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: state.url } });
  });

  it('redirects to /user-dashboard when logged in but not admin', () => {
    spyOn(AuthenticatedUser, 'userLoggedIn').and.returnValue(true);
    spyOn(AuthenticatedUser, 'currentUserAuthenticatedForAdmin').and.returnValue(false);

    const allowed = runGuard();

    expect(allowed).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/user-dashboard']);
  });

  it('allows navigation when logged in and is admin', () => {
    spyOn(AuthenticatedUser, 'userLoggedIn').and.returnValue(true);
    spyOn(AuthenticatedUser, 'currentUserAuthenticatedForAdmin').and.returnValue(true);

    const allowed = runGuard();

    expect(allowed).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
