import { AuthenticatedUser } from './authenticated-user.class';
import { JwtHelperService } from '@auth0/angular-jwt';

describe('AuthenticatedUser', () => {
  const dummyUser = new AuthenticatedUser(
    'testUser',
    ['USER'],
    'dummyToken',
    'Bearer',
    123,
    456,
    'Tutor'
  );
  const dummyJson = dummyUser.toString();

  beforeEach(() => {
    // clear any stored item before each test
    sessionStorage.clear();
    localStorage.clear();
    spyOn(sessionStorage, 'setItem').and.callThrough();
    spyOn(sessionStorage, 'getItem').and.callThrough();
    spyOn(sessionStorage, 'removeItem').and.callThrough();
    spyOn(localStorage, 'getItem').and.callThrough();
  });

  it('should serialize and deserialize via toString()/fromString()', () => {
    const json = dummyUser.toString();
    const parsed = AuthenticatedUser.fromString(json);
    expect(parsed).toEqual(jasmine.objectContaining({
      user: 'testUser',
      roles: ['USER'],
      token: 'dummyToken',
      authType: 'Bearer',
      id: 123,
      profileId: 456,
      profileType: 'Tutor'
    }));
  });

  it('forAdminConsole() should return true if roles include ADMIN', () => {
    const adminUser = new AuthenticatedUser('u', ['USER', 'ADMIN'], '', '', 0, 0, '');
    expect(adminUser.forAdminConsole()).toBeTrue();
    const nonAdmin = new AuthenticatedUser('u', ['USER'], '', '', 0, 0, '');
    expect(nonAdmin.forAdminConsole()).toBeFalse();
  });

  describe('storage methods', () => {
    it('save() writes to sessionStorage and returns the user', () => {
      const saved = AuthenticatedUser.save(
        dummyUser.user,
        dummyUser.roles,
        dummyUser.token,
        dummyUser.authType,
        dummyUser.id,
        dummyUser.profileId,
        dummyUser.profileType
      );
      expect(sessionStorage.setItem)
        .toHaveBeenCalledWith(AuthenticatedUser.key, saved.toString());
      expect(saved).toEqual(dummyUser);
    });

    it('getAuthenticatedUser() returns null if nothing stored', () => {
      (sessionStorage.getItem as jasmine.Spy).and.returnValue(null);
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      expect(AuthenticatedUser.getAuthenticatedUser()).toBeNull();
    });

    it('getAuthenticatedUser() reads from sessionStorage then localStorage', () => {
      (sessionStorage.getItem as jasmine.Spy).and.returnValue(dummyJson);
      const result = AuthenticatedUser.getAuthenticatedUser();
      expect(sessionStorage.getItem).toHaveBeenCalledWith(AuthenticatedUser.key);
      expect(result).toEqual(jasmine.any(AuthenticatedUser));
    });

    it('deleteObj() removes item from sessionStorage', () => {
      AuthenticatedUser.deleteObj();
      expect(sessionStorage.removeItem).toHaveBeenCalledWith(AuthenticatedUser.key);
    });
  });

  describe('static getters', () => {
    beforeEach(() => {
      (sessionStorage.getItem as jasmine.Spy).and.returnValue(dummyJson);
    });

    it('getAuthUserToken() returns token or empty', () => {
      expect(AuthenticatedUser.getAuthUserToken()).toBe('dummyToken');
      (sessionStorage.getItem as jasmine.Spy).and.returnValue(null);
      expect(AuthenticatedUser.getAuthUserToken()).toBe('');
    });

    it('getAuthUserId() returns id or 0', () => {
      expect(AuthenticatedUser.getAuthUserId()).toBe(123);
      (sessionStorage.getItem as jasmine.Spy).and.returnValue(null);
      expect(AuthenticatedUser.getAuthUserId()).toBe(0);
    });

    it('getAuthUserProfileType() returns profileType or empty', () => {
      expect(AuthenticatedUser.getAuthUserProfileType()).toBe('Tutor');
      (sessionStorage.getItem as jasmine.Spy).and.returnValue(null);
      expect(AuthenticatedUser.getAuthUserProfileType()).toBe('');
    });

    it('getAuthUserProfileId() returns profileId or 0', () => {
      expect(AuthenticatedUser.getAuthUserProfileId()).toBe(456);
      (sessionStorage.getItem as jasmine.Spy).and.returnValue(null);
      expect(AuthenticatedUser.getAuthUserProfileId()).toBe(0);
    });

    it('getAuthUserName() returns user or "User"', () => {
      expect(AuthenticatedUser.getAuthUserName()).toBe('testUser');
      (sessionStorage.getItem as jasmine.Spy).and.returnValue(null);
      expect(AuthenticatedUser.getAuthUserName()).toBe('User');
    });

    it('currentUserAuthenticatedForAdmin() follows roles', () => {
      (sessionStorage.getItem as jasmine.Spy).and.returnValue(dummyJson);
      expect(AuthenticatedUser.currentUserAuthenticatedForAdmin()).toBeFalse();
      const adminJson = new AuthenticatedUser('u', ['ADMIN'], '', '', 0, 0, '').toString();
      (sessionStorage.getItem as jasmine.Spy).and.returnValue(adminJson);
      expect(AuthenticatedUser.currentUserAuthenticatedForAdmin()).toBeTrue();
    });
  });

  describe('userLoggedIn()', () => {
    it('returns false when no user stored', () => {
      (sessionStorage.getItem as jasmine.Spy).and.returnValue(null);
      expect(AuthenticatedUser.userLoggedIn()).toBeFalse();
    });
    it('returns  isTokenExpired()', () => {
      spyOn(JwtHelperService.prototype, 'isTokenExpired').and.returnValue(true as any);
      expect(AuthenticatedUser.userLoggedIn()).toBeFalse();

      (JwtHelperService.prototype.isTokenExpired as jasmine.Spy)
        .and.returnValue(false as any);
      expect(AuthenticatedUser.userLoggedIn()).toBeFalse();
    });
  });
});
