import {TestBed, fakeAsync, tick, discardPeriodicTasks} from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthenticatedUser } from './authenticated-user.class';


describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockToken = 'mock.jwt.token';
  const refreshToken = 'mock.refresh.token';
  const decodedToken = {
    exp: Math.floor(Date.now() / 1000) + 3600
  };

  const userData = {
    user: 'testuser',
    roles: ['ROLE_USER'],
    token: mockToken,
    refreshToken,
    authType: 'Bearer',
    id: 123,
    profileId: 456,
    profileType: 'TUTOR'
  };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    spyOn(service.jwtHelper, 'decodeToken').and.returnValue(decodedToken);
    spyOn(AuthenticatedUser.prototype, 'toString').and.callThrough();
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    service['clearAuthenticationCredentials']();
  });

  it('should login and store user in session', () => {
    service.login(
      userData.user,
      userData.roles,
      userData.token,
      userData.refreshToken,
      userData.authType,
      userData.id,
      userData.profileId,
      userData.profileType
    );

    const stored = sessionStorage.getItem(AuthenticatedUser.key);
    expect(stored).toContain('testuser');
    expect(service['refreshInterval']).toBeTruthy();
  });

  it('should logout and clear session and redirect', () => {
    sessionStorage.setItem(AuthenticatedUser.key, 'some-data');
    service.logout();

    expect(sessionStorage.getItem(AuthenticatedUser.key)).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should clear auth credentials and stop refresh interval', () => {
    const fakeInterval = setInterval(() => {}, 1000);
    service['refreshInterval'] = fakeInterval;
    spyOn(window, 'clearInterval');

    service.clearAuthenticationCredentials();

    expect(clearInterval).toHaveBeenCalledWith(fakeInterval);
    expect(service['refreshInterval']).toBeNull();
  });

  it('should start token refresh interval and reset existing interval', fakeAsync(() => {
    spyOn(service as any, 'performTokenRefresh');

    service['startTokenRefreshCycle'](new AuthenticatedUser(
      userData.user,
      userData.roles,
      userData.token,
      userData.authType,
      userData.id,
      userData.profileId,
      userData.profileType
    ));

    tick(service['getRefreshTime'](mockToken));
    expect(service['performTokenRefresh']).toHaveBeenCalled();
    clearInterval((service as any).refreshInterval);
  }));

  it('should perform token refresh and update session', () => {
    const mockUser = new AuthenticatedUser(
      userData.user,
      userData.roles,
      userData.token,
      userData.authType,
      userData.id,
      userData.profileId,
      userData.profileType
    );

    service['performTokenRefresh'](mockUser);

    const req = httpMock.expectOne('/auth/refresh-token');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

    req.flush({ token: 'new.token.value' });

    const updated = sessionStorage.getItem(AuthenticatedUser.key);
    expect(updated).toContain('new.token.value');
  });

  it('should logout if token refresh fails', () => {
    const mockUser = new AuthenticatedUser(
      userData.user,
      userData.roles,
      userData.token,
      userData.authType,
      userData.id,
      userData.profileId,
      userData.profileType
    );

    spyOn(service, 'logout');

    service['performTokenRefresh'](mockUser);

    const req = httpMock.expectOne('/auth/refresh-token');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(service.logout).toHaveBeenCalled();
  });

  it('should calculate correct refresh time', () => {
    const now = new Date().getTime();
    const expected = decodedToken.exp * 1000 - now - service['tokenRefreshThreshold'];
    const actual = service['getRefreshTime'](mockToken);

    expect(actual).toBeCloseTo(expected, -2);
  });

  it('should start token refresh cycle and call refresh function', fakeAsync(() => {
    const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      'eyJleHAiOjQ3MzgwODgwMDB9.' +
      'dummySignature';

    const user = new AuthenticatedUser(
      'testuser',
      ['USER'],
      dummyToken,
      'standard',
      1,
      101,
      'STUDENT'
    );

    spyOn(service as any, 'performTokenRefresh');
    service['startTokenRefreshCycle'](user);
    tick(service['getRefreshTime'](dummyToken));
    expect((service as any).performTokenRefresh).toHaveBeenCalled();

    discardPeriodicTasks();
    clearInterval((service as any).refreshInterval);
  }));

});
