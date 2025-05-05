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

  /**
   * Listens for resize events and updates the view
   */
  @HostListener('window:resize', [])
  onResize(): void {
    this.updateView();
  }

  /**
   * Adjusts window size
   */
  updateView(): void {
    this.isDesktopView = window.innerWidth > 768;
  }

  toggleSidenav(sidenav: any): void {
    sidenav.toggle();
  }

}
