import { Component, OnInit } from '@angular/core';
import {SharedDataService, Instrument, Genre, Qualification} from '../shared-data-service.component';
import {TuitionRegion} from "../../profiles/interfaces/tuition-region.model";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";

@Component({
  selector: 'app-filters-side-bar',
  templateUrl: './filters-side-bar.component.html',
  styleUrls: ['./filters-side-bar.component.scss'],
})
export class FiltersSideBarComponent implements OnInit {
  instruments: (Instrument & { selected: boolean })[] = [];
  genres: (Genre & { selected: boolean })[] = [];
  qualifications:(Qualification & { selected: boolean })[] = [];
  regionSuggestions: any[] = [];
  regionSearchQuery: string = '';
  selectedRegion: TuitionRegion | null = null;
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
  searchQuery: string = '';

  constructor (private http: HttpClient, private router: Router, private sharedDataService: SharedDataService) {

  }

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

  ngOnInit(): void {
    this.sharedDataService.instruments$.subscribe((data) => {
      if (data) {
        this.instruments = data.map((instrument) => ({
          ...instrument,
          selected: false,
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

    this.sharedDataService.qualifications$.subscribe((data) => {
      if (data) {
        this.qualifications = data.map((qualification:Qualification) => ({
          ...qualification,
          selected: false,
        }));
      }
    });

    this.sharedDataService.loadInstruments();
    this.sharedDataService.loadGenres();
    this.sharedDataService.loadQualifications();
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

  getSelectedQualifications(): number[] {
    return this.qualifications.filter((qualification) => qualification.selected)
      .map((qualification) => qualification.id);
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
    if (this.priceRange.min > this.priceRange.max) {
      console.error('Min price cannot be greater than max price.');
      this.priceRange.min = Math.min(this.priceRange.min, this.priceRange.max);
      this.priceRange.max = Math.max(this.priceRange.min, this.priceRange.max);
    }

    console.log('Updated price range:', this.priceRange);
  }

  clearRating() {
    this.selectedRating = 0;
    console.log('Rating filter cleared');
    this.onRatingChange();
  }

  applyFilters(): void {
    console.log('priceRange',this.priceRange)
    const selectedInstruments = this.instruments
      .filter((instrument) => instrument.selected)
      .map((instrument) => instrument.id); // Extract only IDs or relevant values

    const selectedGenres = this.genres
      .filter((genre) => genre.selected)
      .map((genre) => genre.id); // Extract only IDs or relevant values

    const selectedQualifications = this.getSelectedQualifications();
    const isPriceRangeDefault = this.priceRange.min === 0 && this.priceRange.max === 1000;

    const queryParams = {
      keyword: this.searchQuery || null,
      instruments: selectedInstruments.length > 0 ? selectedInstruments : null,
      qualifications: selectedQualifications.length >0 ? selectedQualifications : null,
      genres: selectedGenres.length > 0 ? selectedGenres : null,
      rating: this.selectedRating,
      regionId: this.selectedRegion?.id,
      priceRange: isPriceRangeDefault ? null : [this.priceRange.min, this.priceRange.max],
      profileType: null,
      page: 0,
      size: 8,
      sort: 'displayName,asc'
    };

    // Navigate to the search-results route and pass query parameters
    this.router.navigate(['/profiles/search'], { queryParams });
  }
}
