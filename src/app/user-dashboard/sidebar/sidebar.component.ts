import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isDesktopView: boolean = true;

  constructor() {
    this.checkWindowSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkWindowSize();
  }

  checkWindowSize() {
    this.isDesktopView = window.innerWidth > 768;
  }

  toggleSidenav(sidenav: any) {
    sidenav.toggle();
  }
}
