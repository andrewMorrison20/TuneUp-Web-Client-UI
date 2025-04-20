import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {AdminDashboardComponent} from "./admin-dashboard.component";
import {UsersComponent} from "./users/users.component";
import {adminGuard} from "../authentication/guards/admin-guard";
import {SearchCriteriaComponent} from "./search-criteria/search-criteria.component";


const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent, // Layout Component
    children: [
      { path: 'users', component: UsersComponent },
      { path: 'search', component: SearchCriteriaComponent },
      { path: '', redirectTo: 'users', pathMatch: 'full' } // Default route
    ],canActivate: [adminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminDashboardRoutingModule {}
