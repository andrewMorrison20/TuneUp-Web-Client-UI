import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import {QuizComponent} from "./home/quiz/quiz.component";
export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
    title: 'Home details'
  },
  { path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule),
    title: 'login form'},
  { path: 'signup',
    loadChildren: () => import('./signup/signup.module').then(m => m.SignupModule),
    title: 'login form'},
  { path: 'profiles',
    loadChildren: () => import('./profiles/profile.module').then(m => m.ProfileModule),
  title: 'profiles details'},
  { path: 'accountSettings',
    loadChildren: () => import('./account-settings/account-settings.module').then(m => m.AccountSettingsModule),
    title:'Account Settings',
  },
  { path: 'user-dashboard', loadChildren: () => import('./user-dashboard/user-dashboard.module').then(m => m.UserDashboardModule) },
  { path: 'quiz', component: QuizComponent },

  { path: '**', redirectTo: '/home', pathMatch: 'full' }
];

export default routes;
