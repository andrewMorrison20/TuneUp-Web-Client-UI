import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../profile.service'; // Service to fetch profiles
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

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.fetchProfiles(); // Fetch profiles on initialization
  }

  fetchProfiles(): void {
    this.isLoading = true;

    this.profileService.getProfiles(this.pageIndex, this.pageSize, 'displayName,asc').subscribe({
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
