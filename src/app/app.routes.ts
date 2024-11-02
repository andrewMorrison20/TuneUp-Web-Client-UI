import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
export const routes: Routes = [
  {
    path: 'home2',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
    title: 'Home details'
  },
  { path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule),
    title: 'login form'},
  { path: 'signup',
    loadChildren: () => import('./signup/signup.module').then(m => m.SignupModule),
    title: 'login form'},
  ];

export default routes;
