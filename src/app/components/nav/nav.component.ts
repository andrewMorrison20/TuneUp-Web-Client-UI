import { Component } from '@angular/core';
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";
import {Router} from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  isCollapsed = true;
  constructor(private router: Router) {

  }

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }

  protected readonly AuthenticatedUser = AuthenticatedUser;

  logout(): void {
    AuthenticatedUser.deleteObj();
    this.router.navigate(['/login']);
  }
}
