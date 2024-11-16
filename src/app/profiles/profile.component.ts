import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from './profile.service';
import { TutorProfile } from './interfaces/tutor.model';
import { StudentProfile } from './interfaces/student.model';

type Profile = TutorProfile | StudentProfile;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profile: Profile | null = null;
  profileType: 'tutor' | 'student' | null = null;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
  }

  isTutorProfile(profile: Profile): profile is TutorProfile {
    return (profile as TutorProfile).instruments !== undefined;
  }

  isStudentProfile(profile: Profile): profile is StudentProfile {
    return (profile as StudentProfile).enrolledCourses !== undefined;
  }
}

