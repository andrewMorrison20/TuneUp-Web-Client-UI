import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Genre, Instrument} from "../../components/search-bar/search-bar.component";
import {ProfileService} from "../../profiles/profile.service";
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";
import {TutorProfile} from "../../profiles/interfaces/tutor.model";
import {StudentProfile} from "../../profiles/interfaces/student.model";
import {Price} from "../../profiles/interfaces/price";
import {PeriodMap} from "../../profiles/interfaces/period";
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss']
})
export class UpdateProfileComponent {
  profile!: TutorProfile | StudentProfile;
  pricingList: Price[] = [];
  genres: Genre [] = [];
  instruments : Instrument [] = [];
  profileTypes = ['Student', 'Tutor', 'Parent'];
  durations: string[] = [];
  rates: number[] = [];
  prices :  number[] = [];

  newPricing: Price = {
    period: this.durations[0] || '',
    rate: this.prices[0] || 0,
    standardPricing: true,
    description:''
  };

  customPricing: Price = {
    period: 'CUSTOM',
    rate: 0,
    standardPricing: false,
    description:''
  };

  profilePicturePreview: string | null = null;

  regionSuggestions: any[] = [];
  searchQuery: string = '';
  selectedRegion: any = null;
  qualifications: { name: string; description: string }[] = [];
  newQualification = { name: '', description: '' };
  standardPrices: Price[] =[];

  constructor(private http: HttpClient, protected profileService: ProfileService,  private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadInstruments();
    this.loadGenres();
    this.loadPricing();
  }
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePicturePreview = e.target.result;
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('file', file);

      this.http.post('http://localhost:8080/api/images', formData).subscribe({
        next: (image: any) => {
          this.profile.profilePicture = image;
          this.snackBar.open('Profile photo uploaded successfully.', 'Close', { duration: 3000 });
          console.log('Image uploaded successfully:', image);
        },
        error: (err) => {
          console.error('Error uploading image:', err);
        }
      });
    }
  }

  addPricing(): void {
    if (this.newPricing.period && this.newPricing.rate) {
      // Check for duplicates in pricingList
      const duplicate = this.pricingList.some(
        price => price.period === this.newPricing.period && price.rate === this.newPricing.rate
      );

      if (!duplicate) {
        this.pricingList.push({ ...this.newPricing });
      } else {
        alert('This period and rate combination already exists.');
      }
    }
  }

  addCustomPricing(): void {
    if (this.customPricing.description.trim() && this.customPricing.rate > 0) {
      // Check for duplicates in pricingList
      const duplicate = this.pricingList.some(
        price => price.description === this.customPricing.description && price.rate === this.customPricing.rate
      );

      if (!duplicate) {
        this.pricingList.push({ ...this.customPricing });
        // Reset the customPricing object
        this.customPricing = { period: 'CUSTOM', rate: 0, standardPricing: false, description: '' };
      } else {
        alert('This description and rate combination already exists.');
      }
    }
  }


  removePricing(index: number): void {
    this.pricingList.splice(index, 1);
  }

  onRegionSearch(): void {
    if (this.searchQuery.trim().length > 2) {

      this.http
        .get<any[]>(`http://localhost:8080/api/regions?query=${this.searchQuery.trim()}`)
        .subscribe((data) => {
          this.regionSuggestions = data;
        });
    } else {
      this.regionSuggestions = []
    }
  }

  selectRegion(region: any): void {

    this.selectedRegion = region;
    this.profile.tuitionRegion = region;
    this.regionSuggestions = [];
  }

  onSubmitProfile(): void {
    this.profileService.updateProfile(this.profile).subscribe({
      next: (response) => {
        this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
        console.log('Profile updated successfully:', response);
      },
      error: (err) => {
        this.snackBar.open('Failed to update profile. Please try again.', 'Close', { duration: 3000 });
        console.error('Error updating profile:', err);
      }
    });
  }


  onSubmitPricing(): void {
    this.profileService.updateProfilePricing(this.pricingList, this.profile).subscribe({
      next: (response) => {
        this.snackBar.open('Pricing updated successfully!', 'Close', { duration: 3000 });
        console.log('Pricing updated successfully:', response);
      },
      error: (err) => {
        this.snackBar.open('Failed to update pricing. Please try again.', 'Close', { duration: 3000 });
        console.error('Error updating pricing:', err);
      }
    });
  }

  loadInstruments(): void {
    this.http.get<Instrument[]>('http://localhost:8080/api/instruments')
      .subscribe({
        next: (data) => {
          this.instruments = data; // Store full instrument objects
        },
        error: (err) => {
          this.snackBar.open('Failed to fetched instruments. Please refresh the page.', 'Close', { duration: 3000 });
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
            this.snackBar.open('Failed to fetch genres. Please refresh the page.', 'Close', { duration: 3000 });
            console.error('Error fetching genres :', err);
          }
        })
  }

  private loadProfile() {
    this.profileService.getProfileByAppUserId(AuthenticatedUser.getAuthUserId()) .subscribe({
      next: (data) => {
        this.profile = data;
      },
      error: (err) => {
        this.snackBar.open('Failed to fetch profile. Please refresh the page.', 'Close', { duration: 3000 });
        console.error('Error fetching profile:', err);
      }
    })

  }
  // Add a qualification to the list
  addQualification(): void {
    if (this.newQualification.name.trim() && this.newQualification.description.trim()) {
      this.qualifications.push({ ...this.newQualification });
      this.newQualification = { name: '', description: '' }; // Reset input fields
    } else {
      alert('Both qualification name and description are required.');
    }
  }

  // Remove a qualification from the list
  removeQualification(index: number): void {
    this.qualifications.splice(index, 1);
  }

  // Handle form submission for qualifications
  onSubmitQualifications(): void {
    console.log('Qualifications Submitted:', this.qualifications);
    // Add your backend API call here
    /*this.http
      .post('http://localhost:8080/api/qualifications', {
        profileId: this.profile.id,
        qualifications: this.qualifications,
      })
      .subscribe({
        next: (response) => console.log('Qualifications saved successfully:', response),
        error: (err) => console.error('Error saving qualifications:', err),
      });*/
  }

  loadPricing(): void {
    console.log('Loading standard pricing...');
    this.http.get<Price[]>('http://localhost:8080/api/prices/standardPricing')
      .subscribe({
        next: (data: Price[]) => {
          // Convert backend enum strings to human-readable strings for the frontend
          this.standardPrices = data.map(price => ({
            ...price,
            period: PeriodMap[price.period as keyof typeof PeriodMap] || price.period // Convert enum to human-readable, fallback to raw value
          }));

          console.log('Assigned pricing:', this.standardPrices);

          // Extract durations (human-readable strings) and rates for UI
          this.durations = Array.from(new Set(this.standardPrices.map(p => p.period)));
          console.log('DURATIONS:', this.durations);

          this.rates = Array.from(new Set(this.standardPrices.map(p => p.rate))).sort((a, b) => a - b);
          console.log('Sorted Rates:', this.rates);
        },
        error: (err) => {
          this.snackBar.open('Failed to Pricing. Please refresh the page.', 'Close', { duration: 3000 });
          console.error('Error fetching standard pricing:', err);
        }
      });
  }
}
