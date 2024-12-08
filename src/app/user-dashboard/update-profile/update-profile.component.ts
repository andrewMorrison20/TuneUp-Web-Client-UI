import { Component } from '@angular/core';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss']
})
export class UpdateProfileComponent {
  genres = ['Rock', 'Jazz', 'Classical', 'Pop', 'Hip Hop'];
  instruments = ['Guitar', 'Piano', 'Drums', 'Violin', 'Flute'];
  profileTypes = ['Student', 'Tutor', 'Parent'];

  durations = ['30 mins', '1 hr', '1.5 hrs', '2 hrs', '3 hrs'];
  prices = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]; // Increment by £5

  profile = {
    genre: '',
    instrument: '',
    profileType: '',
    bio: '',
    pricingList: [] as { duration: string; amount: number }[], // List of pricing entries
    profilePicture: null,
  };

  newPricing = {
    duration: this.durations[0], // Default to the first duration
    amount: this.prices[0], // Default to the first price
  };

  // Set amount as a number instead of null
  customPricing = {
    duration: '',
    amount: 0, // Default to 0 or any initial valid number
  };

  profilePicturePreview: string | null = null;

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
    // Ensure valid number for amount and non-empty duration before pushing
    if (this.customPricing.duration.trim() && this.customPricing.amount > 0) {
      this.profile.pricingList.push({ ...this.customPricing });
      this.customPricing = { duration: '', amount: 0 }; // Reset custom pricing inputs
    }
  }

  removePricing(index: number): void {
    this.profile.pricingList.splice(index, 1); // Remove pricing entry by index
  }

  onSubmit(): void {
    console.log('Profile Updated:', this.profile);
    // Logic to save the updated profile
  }
}
