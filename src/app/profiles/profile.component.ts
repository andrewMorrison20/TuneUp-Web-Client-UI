import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from './profile.service';
import { TutorProfile } from './interfaces/tutor.model';
import { StudentProfile } from './interfaces/student.model';

type Profile = TutorProfile | StudentProfile;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profile: Profile | null = null;
  profileType: 'tutor' | 'student' | null = null;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    // Get profile type (tutor or student) and ID from the route parameters
    this.profileType = this.route.snapshot.data['type'];
    const id = this.route.snapshot.paramMap.get('id');

    if (this.profileType && id) {
      // Fetch profile data based on profile type
      if (this.profileType === 'tutor') {
        this.profileService.getTutorProfile(id).subscribe(
          (profile) => (this.profile = profile),
          (error) => console.error('Error fetching tutor profile:', error)
        );
      } else if (this.profileType === 'student') {
        this.profileService.getStudentProfile(id).subscribe(
          (profile) => (this.profile = profile),
          (error) => console.error('Error fetching student profile:', error)
        );
      }
    }
  }

  isTutorProfile(profile: Profile): profile is TutorProfile {
    return (profile as TutorProfile).instruments !== undefined;
  }

  isStudentProfile(profile: Profile): profile is StudentProfile {
    return (profile as StudentProfile).enrolledCourses !== undefined;
  }
}

