import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Instrument {
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
  selectedLocation: string = '';
  selectedInstrumentId: number | null = null; // Store the ID of the selected instrument

  locations: string[] = ['Northern Ireland', 'England', 'Scotland', 'Wales'];
  instruments: Instrument[] = [];
  selectedProfileType: String = "Tutor";

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadInstruments();
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

  onLocationChange(): void {
    console.log('Selected Location:', this.selectedLocation);
  }

  onInstrumentChange(): void {
    console.log('Selected Instrument ID:', this.selectedInstrumentId);
  }

  onSearchClick(): void {
    this.router.navigate(['/profiles/search']);
    console.log('Search Query:', this.searchQuery);
    console.log('Selected Location:', this.selectedLocation);
    console.log('Selected Instrument ID:', this.selectedInstrumentId);
  }

  onProfileTypeChange() {
    console.log('Selected profileType:', this.selectedProfileType);
  }
}

