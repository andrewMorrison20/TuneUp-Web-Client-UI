import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadInstruments();
    this.loadGenres();
  }

  loadInstruments(): void {
    this.http.get<Instrument[]>('http://localhost:8080/api/instruments')
      .subscribe({
        next: (data) => {
          this.instruments = data; // Store full instrument objects
        },
        error: (err) => {
          console.error('Error fetching instruments:', err);
        }
      });
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

  loadGenres(): void {
    this.http.get<Genre[]>('http://localhost:8080/api/genres')
      .subscribe({
        next: (data) => {
          this.genres = data; // Store full instrument objects
        },
        error: (err) => {
          console.error('Error fetching genres:', err);
        }
      });
  }
}

