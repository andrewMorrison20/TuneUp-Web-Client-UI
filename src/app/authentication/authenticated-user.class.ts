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
  public id: number
  public profileId: number;
  public profileType: string;

  constructor(user: string, _console: string, token: string, authType: string, id: number, profileId:number, profileType:string) {
    this.user = user;
    this.console = _console;
    this.token = token;
    this.authType = authType;
    this.id = id;
    this.profileId = profileId;
    this.profileType = profileType;
  }

  toString() {
    return JSON.stringify(this);
  }

  forAdminConsole() {
    return this.console === 'admin';
  }

  static getAuthUserToken(): string {
    const userObj = this.getAuthenticatedUser();
    return userObj ? userObj.token : '';
  }

  static getAuthUserId(): number {
    const userObj = this.getAuthenticatedUser();
    return userObj ? userObj.id : 0;
  }

  static getAuthUserProfileType():string{
    const userObj = this.getAuthenticatedUser();
    return userObj ? userObj.profileType : ""
  }

  static getAuthUserProfileId(): number {
    const userObj = this.getAuthenticatedUser();
    return userObj ? userObj.profileId : 0;
  }

  static getAuthenticatedUser(): AuthenticatedUser | null {
    const json = sessionStorage.getItem(this.key) ?? localStorage.getItem(this.key);
    return json ? this.fromString(json) : null;
  }

  static getAuthUserName(): string {
    const userObj = this.getAuthenticatedUser();
    return userObj ? userObj.user : "User";
  }

  static currentUserAuthenticatedForAdmin(): boolean {
    const currentUser = this.getAuthenticatedUser();
    return currentUser ? currentUser.forAdminConsole() : false;
  }

  static userLoggedIn(): boolean {
    const currentUser = this.getAuthenticatedUser();
    if (currentUser) {
      const helper = new JwtHelperService();
      return !helper.isTokenExpired(currentUser.token);
    }
    return false;
  }

  static save(user: string, _console: string, token: string, authType: string,id: number, profileId:number, profileType:string): AuthenticatedUser {
    const objToSave = new AuthenticatedUser(user, _console, token, authType,id, profileId,profileType);
    sessionStorage.setItem(this.key, objToSave.toString());
    return objToSave;
  }

  static deleteObj() {
    sessionStorage.removeItem(this.key);
  }

  static fromString(json: string): AuthenticatedUser {
    const obj = JSON.parse(json);
    return new AuthenticatedUser(obj.user, obj.console, obj.token, obj.authType,obj.id,obj.profileId,obj.profileType);
  }

  static key = 'authenticatedUser';
}
