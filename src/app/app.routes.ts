import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DetailsComponent } from './details/details.component';
export const routes: Routes = [
  {
      path: 'home',
      component: HomeComponent,
      title: 'Home page'
    },
    {
      path: 'details/:id',
      component: DetailsComponent,
      title: 'Home details'
    },
      {
      path: 'login',
      component: DetailsComponent,
      title: 'Home details'
    },
  {
    path: 'home2',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
    title: 'Home details'
  },

  ];

export default routes;
