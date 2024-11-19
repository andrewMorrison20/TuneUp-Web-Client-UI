import { JwtHelperService } from '@auth0/angular-jwt';

export interface BaseAuthenticatedUser {
  user: string;
  console: string;
  token: string;
}

export class AuthenticatedUser implements BaseAuthenticatedUser {
  public user: string;
  public console: string;
  public token: string;
  public authType: string;

  constructor(user: string, _console: string, token: string, authType: string) {
    this.user = user;
    this.console = _console;
    this.token = token;
    this.authType = authType;
  }

  toString() {
    return JSON.stringify(this);
  }

  forAdminConsole() {
    return this.console === 'admin';
  }

  forUserConsole() {
    return this.console === 'user';
  }

  forTutorConsole() {
    return this.console === 'Tutor';
  }

  static getAuthUserToken(): string {
    const userObj = this.getAuthenticatedUser();
    return userObj ? userObj.token : '';
  }

  static getAuthenticatedUser(): AuthenticatedUser | null {
    const json = sessionStorage.getItem(this.key) ?? localStorage.getItem(this.key);
    return json ? this.fromString(json) : null;
  }

  static currentUserAuthenticatedForAdmin(): boolean {
    const currentUser = this.getAuthenticatedUser();
    return currentUser ? currentUser.forAdminConsole() : false;
  }

  static currentUserAuthenticatedForUser(): boolean {
    const currentUser = this.getAuthenticatedUser();
    return currentUser ? currentUser.forUserConsole() : false;
  }

  static currentUserIsUsingSamlAuth(): boolean {
    const currentUser = this.getAuthenticatedUser();
    return currentUser?.authType === 'SAML_AUTH';
  }

  static userLoggedIn(): boolean {
    const currentUser = this.getAuthenticatedUser();
    if (currentUser) {
      const helper = new JwtHelperService();
      return !helper.isTokenExpired(currentUser.token);
    }
    return false;
  }

  static userTokenExists(): boolean {
    return this.getAuthenticatedUser() !== null;
  }

  static save(user: string, _console: string, token: string, authType: string): AuthenticatedUser {
    const objToSave = new AuthenticatedUser(user, _console, token, authType);
    sessionStorage.setItem(this.key, objToSave.toString());
    return objToSave;
  }

  static deleteObj() {
    sessionStorage.removeItem(this.key);
  }

  static fromString(json: string): AuthenticatedUser {
    const obj = JSON.parse(json);
    return new AuthenticatedUser(obj.user, obj.console, obj.token, obj.authType);
  }

  static key = 'authenticatedUser';
}
