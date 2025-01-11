import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {SharedDataService} from "../shared-data-service.component";

export interface Instrument {
  name: string;
  id: number;
}

export interface Genre {
  name: string;
  id: number;
}

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  searchQuery: string = '';
  selectedInstrumentId: number[] | null = null;
  selectedGenreId: number[] | null = null;

  instruments: Instrument[] = [];
  selectedProfileType: string = "";
  genres: Genre[] = [];

  availability = {
    startDate: null,
    endDate: null,
  };

  updateSearchCriteria(): void {
    // Combine search criteria here
    const criteria = {
      startDate: this.availability.startDate,
      endDate: this.availability.endDate,
      // Add other search parameters like selectedGenreId, etc.
    };

    //this.performSearch(criteria);
  }

  constructor(private http: HttpClient, private router: Router, private sharedDataService: SharedDataService) {}

  ngOnInit(): void {
    this.sharedDataService.instruments$.subscribe((data) => {
      if (data) this.instruments = data;
    });
    this.sharedDataService.genres$.subscribe((data) => {
      if (data) this.genres = data;
    });

    this.sharedDataService.loadInstruments();
    this.sharedDataService.loadGenres();
  }

  onInstrumentChange(): void {
    console.log('Selected Instrument ID:', this.selectedInstrumentId);
  }

  onGenreChange(): void {
    console.log('Selected genre ID:', this.selectedGenreId);
  }

  onSearchClick(): void {
    // Construct the query object
    const queryParams = {
      keyword: this.searchQuery || null,
      instruments: this.selectedInstrumentId || null,
      genres: this.selectedGenreId ||null,
      profileType: this.selectedProfileType || null,
      page: 0,
      size: 8,
      sort: 'displayName,asc'
    };

    // Navigate to the search-results route and pass query parameters
    this.router.navigate(['/profiles/search'], { queryParams });
  }

  onProfileTypeChange() {
    console.log('Selected profileType:', this.selectedProfileType);
  }

}

