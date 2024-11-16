import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) {}

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
    // You can log the selected instrument id or any other processing
    console.log('Selected Instrument ID:', this.selectedInstrumentId);
  }

  onSearchClick(): void {
    console.log('Search Query:', this.searchQuery);
    console.log('Selected Location:', this.selectedLocation);
    console.log('Selected Instrument ID:', this.selectedInstrumentId);
  }
}

