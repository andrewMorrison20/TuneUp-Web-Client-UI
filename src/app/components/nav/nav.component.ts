import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  // Variable to toggle the menu on smaller screens
  isCollapsed = true;

  // Toggle the collapse state of the menu
  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }
}
