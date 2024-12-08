import { Component } from '@angular/core';

@Component({
  selector: 'app-study-hub',
  templateUrl: './study-hub.component.html',
  styleUrl: './study-hub.component.scss'
})
export class StudyHubComponent {
  isSidebarOpen: boolean = true; // Sidebar is open by default

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen; // Toggle the sidebar state
  }
}
