import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { filter } from 'rxjs/operators';
import { AuthenticatedUser } from '../authentication/authenticated-user.class';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isDesktopView = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateView();

    // Whenever navigation finishes, if we're in mobile mode, close the drawer.
    this.router.events
      .pipe(filter(evt => evt instanceof NavigationEnd))
      .subscribe(() => {
        if (!this.isDesktopView && this.sidenav.opened) {
          this.sidenav.close();
        }
      });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateView();
  }

  private updateView(): void {
    this.isDesktopView = window.innerWidth > 768;
  }

  toggleSidenav(): void {
    this.sidenav.toggle();
  }

  isTutorProfile(): boolean {
    return AuthenticatedUser.getAuthUserProfileType().toLowerCase() === 'tutor';
  }

  getDashboardTitle(): string {
    return `${AuthenticatedUser.getAuthUserName()}'s Dashboard`;
  }
}
