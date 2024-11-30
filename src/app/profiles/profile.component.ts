import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from './profile.service';
import { TutorProfile } from './interfaces/tutor.model';
import { StudentProfile } from './interfaces/student.model';

type Profile = TutorProfile | StudentProfile;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: Profile | null = null;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      console.log("Id is :", id);
      console.log("params are:", params);

      if (id) {
        this.fetchProfile(id);
        console.log('profile is :', this.profile);
      }
    });
  }
  fetchProfile(id: string): void {
    this.profileService.getProfileById(id).subscribe(
      (profile) => {
        // Assign the fetched profile data to the profile variable
        this.profile = profile;
        console.log('Profile is', profile);
        this.profileService.getProfileReviews(this.profile)// To check the profile data
      },
      (error) => {
        // Handle error
        console.error('Error fetching profile:', error);
      }
    );
  }


  isStudentProfile(profile: Profile): profile is StudentProfile {
    return (profile as StudentProfile).enrolledCourses !== undefined;
  }

  isTutorProfile(profile: Profile): profile is TutorProfile {
    return (profile as TutorProfile).qualifications !== undefined;
  }

  getProfile(): Profile {
    if (this.profile === null) {
      throw new Error("Profile not loaded yet.");
    }
    return this.profile;
  }

  startChat(): void {
    console.log('Starting chat with', this.profile?.name);

  }
}

