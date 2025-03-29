import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-details',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  searchBannerExpanded: boolean = false;
  isMobile: boolean = false;

  constructor(private router: Router) {}

  @HostListener('window:resize')
  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  toggleSearchBanner(): void {
    this.searchBannerExpanded = !this.searchBannerExpanded;
  }

  onTakeQuiz(): void {
    this.router.navigate(['/quiz']);
  }
}

