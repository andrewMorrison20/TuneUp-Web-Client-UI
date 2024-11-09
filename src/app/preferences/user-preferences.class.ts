import { Injectable } from "@angular/core";
import { AuthenticatedUser } from "../authentication/authenticated-user.class";

@Injectable()
export class UserPreferencesService {
    public static SESSION_KEY: "TUNEUP_UserPref";
    public static userPreferences: UserPreferences | null = null;

    consructor(){
        UserPreferencesService.userPreferences = UserPreferences.loadFromSession();
    }

    public static reloadFromSession() {
        UserPreferencesService.userPreferences = UserPreferences.loadFromSession();
    }

    public static clearPreferences() {
        if(this.userPreferences) {
            this.userPreferences.clearPreferences();
        }
    }
}

export class UserPreferences {
    public userName: string;
    public markDownPreviewDisplayed = true;
    public markDownPreviewPreference: MarkDownPreviewDisplay = 0;

    constructor(arg: string) {
        this.userName = arg;
    }

    public setMarkDownOrientation(arg: MarkDownPreviewDisplay): UserPreferences {
        this.markDownPreviewPreference = arg;
        this.savePreferences();
        return this;
    }

    public setMarkDownPreviewDisplayed(arg: boolean): UserPreferences{
        if (arg != null) {
            this.markDownPreviewDisplayed = arg;
            this.savePreferences();
        }
        return this
    }

    public savePreferences() {
        localStorage.setItem(UserPreferencesService.SESSION_KEY, JSON.stringify(this));
    }

    public clearPreferences() {
        localStorage.removeItem(UserPreferencesService.SESSION_KEY);
    }

    public static loadFromSession(): UserPreferences | null {
        const userObj = AuthenticatedUser.getAuthenticatedUser();
        if(userObj == null){
            return null;
        }
        const preference = UserPreferences.parseFromJson( localStorage.getItem(UserPreferencesService.SESSION_KEY) ?? '', userObj);
        if(preference.userName !== userObj.user){
            return new UserPreferences(userObj.user);
        }
        return preference;
    }

    public static parseFromJson(jsonString: string, userObj: AuthenticatedUser){
        if(jsonString == null || jsonString.trim().length == 0){
            return new UserPreferences(userObj.user);
        }
        const json = JSON.parse(jsonString);
        const pref = new UserPreferences(json.userName);
        pref.markDownPreviewPreference = json.markDownPreviewPreference;
        pref.markDownPreviewDisplayed = json.markDownPreviewDisplayed;
        return pref;
    }

}
    export enum MarkDownPreviewDisplay {
        VERTICAL,
        HORIZONTAL
    }

