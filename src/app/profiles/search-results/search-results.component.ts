import { Component, OnInit } from '@angular/core';
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
  keyword: string | null = null;
  country: string | null = null;
  instruments: number[] | null = null;
  profileType: string | null = null;

  constructor(private profileService: ProfileService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Fetch query parameters and load profiles
    this.route.queryParams.subscribe((params) => {
      this.keyword = params['keyword'] || null;
      this.country = params['country'] || null;
      this.instruments = params['instruments'] ? JSON.parse(params['instruments']) : null;
      this.profileType = params['profileType'] || null;
      this.pageIndex = params['page'] || 0;
      this.pageSize = params['size'] || 10;

      this.fetchProfiles();
    });
  }

  fetchProfiles(): void {
    this.isLoading = true;

    const searchParams = {
      keyword: this.keyword,
      country: this.country,
      instruments: this.instruments,
      profileType: this.profileType
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
}
