import { JwtHelperService } from '@auth0/angular-jwt';

export interface BaseAuthenticatedUser {
    user: string;
    console: string;
    token : string;
    refreshToken: string;
}

export class AuthenticatedUser implements BaseAuthenticatedUser {
    public user: string;
    public console: string;
    public token : string;
    public refreshToken: string;
    public authType: string;

    constructor(user: string, _console: string, token : string, refreshToken: string, authType: string){
        this.user = user;
        this.console = _console;
        this.token = token;
        this.refreshToken = refreshToken;
        this.authType = authType;
    }

    toString() {
        return JSON.stringify(this);
    }

    forAdminConsole() {
        return this.console == 'admin';
    }

    forUserConsole() {
        return this.console === 'user';
    }

    forTutorConsole() {
        return this.console === 'Tutor';
    }

    static getAuthUserToken(){
        const userObj = AuthenticatedUser.fromString(sessionStorage.getItem(AuthenticatedUser.key) ?? localStorage.getItem(AuthenticatedUser.key) ?? '');
        if (userObj) {
            return userObj.token;
        }
        return '';
    }

    static getAuthRefreshToken(){
        const userObj = AuthenticatedUser.fromString(sessionStorage.getItem(AuthenticatedUser.key) ?? localStorage.getItem(AuthenticatedUser.key) ?? '');
        if (userObj) {
            return userObj.refreshToken;
        }
        return '';
    }

    static getAuthenticatedUser() {
        return AuthenticatedUser.fromString(sessionStorage.getItem(AuthenticatedUser.key) ?? localStorage.getItem(AuthenticatedUser.key) ?? '');
    }

    static currentUserAuthenticatedForAdmin() {
        const currentUser =AuthenticatedUser.fromString(sessionStorage.getItem(AuthenticatedUser.key) ?? localStorage.getItem(AuthenticatedUser.key) ?? '');
        if(currentUser){
            return currentUser.forAdminConsole();
        }
        return false;
    }

    static currentUserAuthenticatedForUser() {
        const currentUser =AuthenticatedUser.fromString(sessionStorage.getItem(AuthenticatedUser.key) ?? localStorage.getItem(AuthenticatedUser.key) ?? '');
        if(currentUser){
            return currentUser.forUserConsole();
        }
        return false;
    }

    static currentUserIsUsingSamlAuth() {
        const currentUser = AuthenticatedUser.fromString(sessionStorage.getItem(AuthenticatedUser.key) ?? localStorage.getItem(AuthenticatedUser.key) ?? '');
        return !!(currentUser && currentUser.authType =='SAML_AUTH');
    }

    static userLoggedIn(): boolean {
        const currentUser = AuthenticatedUser.fromString(sessionStorage.getItem(AuthenticatedUser.key) ?? localStorage.getItem(AuthenticatedUser.key) ?? '');
        if (currentUser){
            const helper = new JwtHelperService();
            return !helper.isTokenExpired(currentUser.token);
        }
        return false;
    }

    static userTokenExists(): boolean {
        const currentUser =  AuthenticatedUser.fromString(sessionStorage.getItem(AuthenticatedUser.key) ?? localStorage.getItem(AuthenticatedUser.key) ?? '');
        return currentUser != null;
    }

    static save(user: string, _console: string,token:string, refreshToken:string,authType:string){
        const objToSave = new AuthenticatedUser(user,_console,token,refreshToken,authType);
        sessionStorage.setItem(AuthenticatedUser.key, objToSave.toString());
        return objToSave;
    }

    static deleteObj() {
        sessionStorage.removeItem(AuthenticatedUser.key)
    }
    static fromString(json: string){
        if(!json){
            return null;
        }
        const obj = JSON.parse(json);
        const user = new AuthenticatedUser(obj.user,obj.console, obj.token,obj.refreshToken,obj.authType);
        return user;
    }
    static key = 'authenticatedUser';
}
