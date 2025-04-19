import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {profileTypeGuard} from "./profile-type-guard";
import {AuthenticatedUser} from "../authenticated-user.class";


describe('profileTypeGuard', () => {
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

    // prepare a fake snapshot with data.expectedProfileType
    route = {data: {expectedProfileType: 'Tutor'}} as unknown as ActivatedRouteSnapshot;
    state = { url: '/some/path' } as RouterStateSnapshot;
  });

  function runGuard(): boolean {
    return TestBed.runInInjectionContext(() => profileTypeGuard(route, state));
  }

  it('allows navigation when user.profileType matches expectedProfileType (case‑insensitive)', () => {
    const user = new AuthenticatedUser('u', [], 't', '', 1, 2, 'TuToR');
    spyOn(AuthenticatedUser, 'getAuthenticatedUser').and.returnValue(user);

    const allowed = runGuard();
    expect(allowed).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('redirects when there is no authenticated user', () => {
    spyOn(AuthenticatedUser, 'getAuthenticatedUser').and.returnValue(null);

    const allowed = runGuard();
    expect(allowed).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/user-dashboard']);
  });

  it('redirects when user.profileType does not match', () => {
    const user = new AuthenticatedUser('u', [], 't', '', 1, 2, 'Student');
    spyOn(AuthenticatedUser, 'getAuthenticatedUser').and.returnValue(user);

    const allowed = runGuard();
    expect(allowed).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/user-dashboard']);
  });
});
