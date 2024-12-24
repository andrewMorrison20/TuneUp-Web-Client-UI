import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Genre, Instrument} from "../../components/search-bar/search-bar.component";
import {ProfileService} from "../../profiles/profile.service";
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";
import {TutorProfile} from "../../profiles/interfaces/tutor.model";
import {StudentProfile} from "../../profiles/interfaces/student.model";


@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss']
})
export class UpdateProfileComponent {
  profile!: TutorProfile | StudentProfile;
  pricingList: { duration: string; amount: number }[] = [];
  genres: Genre [] = [];
  instruments : Instrument [] = [];
  profileTypes = ['Student', 'Tutor', 'Parent'];
  durations = ['30 mins','45 mins', '1 hr', '1.25 hrs','1.5 hr','2 hrs','2.25 hrs','2.5 hrs', '3 hrs'];
  prices = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50,55,60,65,70,75,80,85,90];

  newPricing = {
    duration: this.durations[0], // Default to the first duration
    amount: this.prices[0], // Default to the first price
  };

  customPricing = {
    duration: '',
    amount: 0,
  };

  profilePicturePreview: string | null = null;

  regionSuggestions: any[] = [];
  searchQuery: string = '';
  selectedRegion: any = null;

  constructor(private http: HttpClient, private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfile();
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

      const formData = new FormData();
      formData.append('file', file);

      this.http.post('http://localhost:8080/api/images', formData).subscribe({
        next: (image: any) => {
          this.profile.profilePicture = image;
          console.log('Image uploaded successfully:', image);
        },
        error: (err) => {
          console.error('Error uploading image:', err);
        }
      });
    }
  }

  addPricing(): void {
    if (this.newPricing.duration && this.newPricing.amount) {
      this.pricingList.push({ ...this.newPricing });
    }
  }

  addCustomPricing(): void {
    if (this.customPricing.duration.trim() && this.customPricing.amount > 0) {
      this.pricingList.push({ ...this.customPricing });
      this.customPricing = { duration: '', amount: 0 };
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
    console.log('Profile Updated:', this.profile);
   this.profileService.updateProfile(this.profile);
  }

  onSubmitPricing(): void {
    console.log('Pricing Updated:', this.profile);
    this.http
      .put('http:localhost:8080/api/profiles/update', this.profile)
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

  private loadProfile() {
    this.profileService.getProfileByAppUserId(AuthenticatedUser.getAuthUserId()) .subscribe({
      next: (data) => {
        this.profile = data; // Store full instrument objects
      },
      error: (err) => {
        console.error('Error fetching instruments:', err);
      }
    })

  }
}
