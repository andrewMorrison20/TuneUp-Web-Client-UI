import {Component, HostListener, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../profile.service';
import { TutorProfile } from '../interfaces/tutor.model';
import { StudentProfile } from '../interfaces/student.model';

type Profile = TutorProfile | StudentProfile;

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  profiles: Profile[] = []; // List of profiles to display
  isLoading = false;
  error: string | null = null;

  // Pagination properties
  totalElements = 0;
  pageSize = 8; // Items per page
  pageIndex = 0; // Current page index

  // Search criteria
  rating: number |null = null;
  regionId: number | null = null;
  keyword: string | null = null;
  genres:number[] | null = null;
  instruments: number[] | null = null;
  profileType: string | null = null;
  isMobile: boolean = false;
  filtersBannerExpanded: boolean = false;
  searchBannerExpanded: boolean = false;

  constructor(private profileService: ProfileService, private route: ActivatedRoute) {}

  ngOnInit(): void {

    this.checkScreenSize();
    this.route.queryParams.subscribe((params) => {
      this.keyword = params['keyword'] || null;
      this.rating = params['rating'] || null;
      this.genres = params['genres'] || null;
      this.regionId = params['regionId'] || null;
      this.instruments = params['instruments'] || null;
      this.profileType = params['profileType'] || null;
      this.pageIndex = params['page'] || 0;
      this.pageSize = params['size'] || 8;
      this.fetchProfiles();
    });
  }

  toggleFiltersBanner(): void {
    this.filtersBannerExpanded = !this.filtersBannerExpanded;
  }

  toggleSearchBanner(): void {
    this.searchBannerExpanded = !this.searchBannerExpanded;
  }
  fetchProfiles(): void {
    this.isLoading = true;
    this.error = null
    const searchParams = {
      keyword: this.keyword,
      genres:this.genres ? (Array.isArray(this.genres) ? this.genres : [this.genres]) : null,
      regionId: this.regionId,
      instruments: this.instruments ? (Array.isArray(this.instruments) ? this.instruments : [this.instruments]) : null,
      profileType: this.profileType,
      rating:this.rating
    };

    this.profileService.getFilteredProfiles(searchParams, this.pageIndex, this.pageSize, 'displayName,asc').subscribe({
      next: (data) => {
        this.profiles = data.profiles;
        this.totalElements = data.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching profiles:', err);
        this.error = 'An error occurred while loading profiles.';
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchProfiles(); // Fetch profiles for the new page
  }

  @HostListener('window:resize')
  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  toggleSidenav(): void {
    const sidenav = document.querySelector('mat-sidenav') as any;
    sidenav.toggle();
  }
}
