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
import {Qualification, SharedDataService} from "../../components/shared-data-service.component";
import {environment} from "../../../environments/environment";


@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss']
})
export class UpdateProfileComponent {
  profile!: TutorProfile | StudentProfile;
  pricingList: Price[] = [];
  genres: Genre [] = [];
  qualifications: Qualification [] = [];
  instruments : Instrument [] = [];
  profileTypes = ['Student', 'Tutor', 'Parent'];
  durations: string[] = [];
  rates: number[] = [];
  prices :  number[] = [];
  newQualification: { qualification: Qualification | null; instrument: Instrument | null} = {
    qualification: null,
    instrument: null,
  };

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

  lessonTypes = ['Online', 'In Person', 'Online & In-Person'];

  profilePicturePreview: string | null = null;

  regionSuggestions: any[] = [];
  searchQuery: string = '';
  selectedRegion: any = null;
  standardPrices: Price[] =[];
  selectedQualifications: { qualification: Qualification; instrument: Instrument; }[] = [];

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, protected profileService: ProfileService,private sharedDataService: SharedDataService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {

    this.loadProfile();
    this.loadPricing();

    this.sharedDataService.instruments$.subscribe((data) => {
      if (data) {
        this.instruments = data.map((instrument:Instrument) => ({
          ...instrument,
          selected: false,
        }));
      }
    });
    this.sharedDataService.loadInstruments();

    this.sharedDataService.genres$.subscribe((data) => {
      if (data) {
        this.genres = data.map((genre:Genre) => ({
          ...genre,
          selected: false,
        }));
      }
    });
    this.sharedDataService.loadGenres();

    this.sharedDataService.qualifications$.subscribe((data) => {
      if (data) {
        this.qualifications = data.map((qualification:Qualification) => ({
          ...qualification,
          selected: false,
        }));
      }
    });
    this.sharedDataService.loadQualifications();
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

      this.http.post( this.baseUrl + '/images', formData).subscribe({
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
    if (
      this.isValidDescription(this.customPricing.description) &&
      this.isValidRate(this.customPricing.rate)
    ) {
      // Check for duplicates in pricingList
      const duplicate = this.pricingList.some(
        price =>
          price.description === this.customPricing.description &&
          price.rate === this.customPricing.rate
      );

      if (!duplicate) {
        this.pricingList.push({ ...this.customPricing });
        this.customPricing = { period: 'CUSTOM', rate: 0, standardPricing: false, description: '' };
      } else {
        alert('This description and rate combination already exists.');
      }
    } else {
      if (!this.isValidDescription(this.customPricing.description)) {
        alert('Description must be provided and be 50 characters or fewer.');
      } else if (!this.isValidRate(this.customPricing.rate)) {
        alert('Please enter a valid price with up to two decimal places (e.g., 10.99).');
      }
    }
  }

  private isValidDescription(description: string): boolean {
    return description.trim().length > 0 && description.length <= 50;
  }


  private isValidRate(rate: number): boolean {
    return /^\d+(\.\d{1,2})?$/.test(rate.toString());
  }

  removePricing(index: number): void {
    this.pricingList.splice(index, 1);
  }

  onRegionSearch(): void {
    if (this.searchQuery.trim().length > 2) {

      this.http
        .get<any[]>(`${this.baseUrl}/regions?query=${this.searchQuery.trim()}`)
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


  addQualification(): void {
    console.log(this.newQualification)
    if (this.newQualification.qualification && this.newQualification.instrument) {
      const duplicate = this.selectedQualifications.some(
        qualification => qualification.qualification === this.newQualification.qualification
        && qualification.instrument === this.newQualification.instrument
      );

      if(!duplicate) {
        this.selectedQualifications.push({
          qualification: this.newQualification.qualification as Qualification,
          instrument: this.newQualification.instrument as Instrument
        });
      }
      else{
        alert('This qualification combination already exists.');
      }
      // Reset input fields
      this.newQualification = { qualification: null, instrument: null };
    } else {
      alert('Both qualification and instrument are required.');
    }
  }


  // Remove a qualification from the list
  removeQualification(index: number): void {
    this.selectedQualifications.splice(index, 1);
  }

  // Handle form submission for qualifications
  onSubmitQualifications(): void {
    const qualificationsToSubmit = this.selectedQualifications.map(q => ({
      qualificationId: q.qualification.id,  // Extract only the ID
      instrumentId: q.instrument.id         // Extract only the ID
    }));
    console.log('Submitting Qualifications:', qualificationsToSubmit);
    this.profileService.updateProfileQualifications(qualificationsToSubmit, this.profile).subscribe({
      next: (response) => {
        this.snackBar.open('Qualifications updated successfully!', 'Close', { duration: 3000 });
        console.log('Qualification  updated successfully:', response);
      },
      error: (err) => {
        this.snackBar.open('Failed to update Qualifications. Please try again.', 'Close', { duration: 3000 });
        console.error('Error updating qualifications', err);
      }
    });
  }

  loadPricing(): void {
    console.log('Loading standard pricing...');
    this.http.get<Price[]>(`${this.baseUrl}/prices/standardPricing`)
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
