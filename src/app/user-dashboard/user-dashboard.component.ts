import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
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
