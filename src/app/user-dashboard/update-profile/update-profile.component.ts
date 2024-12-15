import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Genre, Instrument} from "../../components/search-bar/search-bar.component";


@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss']
})
export class UpdateProfileComponent {
  genres: Genre [] = [];
  instruments : Instrument [] = [];
  profileTypes = ['Student', 'Tutor', 'Parent'];

  durations = ['30 mins', '1 hr', '1.5 hrs', '2 hrs', '3 hrs'];
  prices = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]; // Increment by £5

  profile = {
    genres: '',
    instruments: '',
    profileType: '',
    bio: '',
    pricingList: [] as { duration: string; amount: number }[], // List of pricing entries
    profilePicture: null,
    tuitionRegion: null, // Add tuition region property to profile
  };

  newPricing = {
    duration: this.durations[0], // Default to the first duration
    amount: this.prices[0], // Default to the first price
  };

  customPricing = {
    duration: '',
    amount: 0, // Default to 0 or any initial valid number
  };

  profilePicturePreview: string | null = null;

  regionSuggestions: any[] = []; // List of suggestions for the region search
  searchQuery: string = ''; // Search query for the tuition region
  selectedRegion: any = null; // Selected region object

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadInstruments();
    this.loadGenres();
  }
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePicturePreview = e.target.result;
      };
      reader.readAsDataURL(file);
      this.profile.profilePicture = file;
    }
  }

  addPricing(): void {
    if (this.newPricing.duration && this.newPricing.amount) {
      this.profile.pricingList.push({ ...this.newPricing });
    }
  }

  addCustomPricing(): void {
    if (this.customPricing.duration.trim() && this.customPricing.amount > 0) {
      this.profile.pricingList.push({ ...this.customPricing });
      this.customPricing = { duration: '', amount: 0 }; // Reset custom pricing inputs
    }
  }

  removePricing(index: number): void {
    this.profile.pricingList.splice(index, 1); // Remove pricing entry by index
  }

  onRegionSearch(): void {
    if (this.searchQuery.trim().length > 2) {
      // Call the backend API to fetch region suggestions
      this.http
        .get<any[]>(`http://localhost:8080/api/regions?query=${this.searchQuery.trim()}`)
        .subscribe((data) => {
          this.regionSuggestions = data; // Populate suggestions
        });
    } else {
      this.regionSuggestions = []
    }
  }

  selectRegion(region: any): void {
    // Set the selected region and update the profile's tuition region
    this.selectedRegion = region;
    this.profile.tuitionRegion = region; // Save region in the profile object
    this.regionSuggestions = [];
  }

  onSubmit(): void {
    console.log('Profile Updated:', this.profile);
    // Logic to save the updated profile (e.g., HTTP PUT request to backend)
    this.http
      .put('/api/profiles', this.profile)
      .subscribe((response) => console.log('Profile updated successfully', response));
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
      })
  }

    loadGenres(): void {
      this.http.get<Genre[]>('http://localhost:8080/api/genres')
        .subscribe({
          next: (data) => {
            this.genres = data; // Store full genre objects
          },
          error: (err) => {
            console.error('Error fetching genres :', err);
          }
        })
  }
}
