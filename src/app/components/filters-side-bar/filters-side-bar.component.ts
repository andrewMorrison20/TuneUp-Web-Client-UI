import { Component, OnInit } from '@angular/core';
import { SharedDataService, Instrument, Genre } from '../shared-data-service.component';

@Component({
  selector: 'app-filters-side-bar',
  templateUrl: './filters-side-bar.component.html',
  styleUrls: ['./filters-side-bar.component.scss'],
})
export class FiltersSideBarComponent implements OnInit {
  instruments: (Instrument & { selected: boolean })[] = [];
  genres: (Genre & { selected: boolean })[] = [];
  regionSuggestions: any[] = [];
  regionSearchQuery: string = '';
  selectedRegion: any = null;

  constructor(private sharedDataService: SharedDataService) {}

  ngOnInit(): void {
    this.sharedDataService.instruments$.subscribe((data) => {
      if (data) {
        this.instruments = data.map((instrument) => ({
          ...instrument,
          selected: false, // Initialize selected state
        }));
      }
    });

    this.sharedDataService.genres$.subscribe((data) => {
      if (data) {
        this.genres = data.map((genre) => ({
          ...genre,
          selected: false,
        }));
      }
    });

    this.sharedDataService.loadInstruments();
    this.sharedDataService.loadGenres();

    this.sharedDataService.regions$.subscribe((data) => {
      this.regionSuggestions = data;
    })
  }

  getSelectedGenres(): Genre[] {
    return this.genres.filter((genre) => genre.selected);
  }

  getSelectedInstruments(): Instrument[] {
    return this.instruments.filter((instrument) => instrument.selected);
  }

  onRegionSearch(): void {
    this.sharedDataService.searchRegions(this.regionSearchQuery);
  }

  selectRegion(region: any): void {
    this.selectedRegion = region;
    this.sharedDataService.selectRegion(region);
  }

  clearSelection() {
      this.selectedRegion = null;
  }
}
