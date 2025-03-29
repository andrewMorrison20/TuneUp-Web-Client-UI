import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'app-details',
  templateUrl:'./home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  searchBannerExpanded: boolean = false;
  isMobile: boolean = false;

  @HostListener('window:resize')
  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }
  toggleSearchBanner(): void {
    this.searchBannerExpanded = !this.searchBannerExpanded;
  }

  onTakeQuiz(){

  };

}
