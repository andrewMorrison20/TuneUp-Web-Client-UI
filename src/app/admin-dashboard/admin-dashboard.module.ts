import {NgModule} from "@angular/core";
import {AdminDashboardComponent} from "./admin-dashboard.component";
import {SidebarComponent} from "../user-dashboard/sidebar/sidebar.component";
import {CommonModule} from "@angular/common";
import {NavModule} from "../components/nav/nav.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FooterModule} from "../components/footer/footer.module";
import {SharedModule} from "../shared/shared.module";
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {HttpClientModule} from "@angular/common/http";
import {AdminDashboardRoutingModule} from "./admin-dashboard.routing.module";
import {UsersComponent} from "./users/users.component";


@NgModule({
  declarations: [
   AdminDashboardComponent,
    UsersComponent
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
})
export class AdminDashboardModule { }
