import { Component, HostListener, OnInit } from '@angular/core';
import {AuthenticatedUser} from "../authentication/authenticated-user.class";

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  isDesktopView: boolean = true;


  ngOnInit(): void {
    this.updateView();
  }

  @HostListener('window:resize', [])
  onResize(): void {
    this.updateView();
  }

  updateView(): void {
    this.isDesktopView = window.innerWidth > 768; // Adjust breakpoint as needed
  }

  toggleSidenav(sidenav: any): void {
    sidenav.toggle(); // Toggles sidebar visibility
  }

}
