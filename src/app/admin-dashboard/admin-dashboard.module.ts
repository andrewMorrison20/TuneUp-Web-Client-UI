import {NgModule} from "@angular/core";
import {AdminDashboardComponent} from "./admin-dashboard.component";
import {CommonModule} from "@angular/common";
import {NavModule} from "../components/nav/nav.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FooterModule} from "../components/footer/footer.module";
import {SharedModule} from "../shared/shared.module";
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {HttpClientModule} from "@angular/common/http";
import {AdminDashboardRoutingModule} from "./admin-dashboard.routing.module";
import {UsersComponent} from "./users/users.component";
import {AdminService} from "./admin.service";
import {SearchCriteriaComponent} from "./search-criteria/search-criteria.component";


@NgModule({
  declarations: [
   AdminDashboardComponent,
    UsersComponent,
    SearchCriteriaComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    AdminDashboardRoutingModule,
    NavModule,
    FormsModule,
    FooterModule,
    SharedModule,
    ReactiveFormsModule,
    RouterOutlet,
    RouterLinkActive,
    RouterLink,
  ],
  providers:[ AdminService]
})
export class AdminDashboardModule { }
