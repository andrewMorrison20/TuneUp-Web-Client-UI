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
  minPrice: number = 0;
  maxPrice: number = 1000;
  priceRange = { min: 0, max: 1000 };
  ratings = [
    { label: '> 1 Star', value: 1 },
    { label: '> 2 Stars ', value: 2 },
    { label: '> 3 Stars', value: 3 },
    { label: '> 4 Stars', value: 4 },
    { label: '5 Stars Only', value: 5 }
  ];

  selectedRating: number = 0;

  getStars(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => (i < rating ? 'star' : 'star_border'));
  }

  selectRating(rating: number) {
    this.selectedRating = rating;
    console.log('Selected Rating:', this.selectedRating);
    this.onRatingChange();
  }

  onRatingChange() {
    console.log('Filter profiles by rating:', this.selectedRating);
  }
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
  onPriceChange() {
    console.log('Price range updated:', this.priceRange);
    // Emit or handle the updated price range here
  }

  formatLabel(value: number): string {
    return `$${value}`;
  }
  clearRating() {
    this.selectedRating = 0;
    console.log('Rating filter cleared');
    this.onRatingChange();
  }

}
