import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { ProfileService } from './profile.service';
import { TutorProfile } from './interfaces/tutor.model';
import { StudentProfile } from './interfaces/student.model';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

type Profile = TutorProfile | StudentProfile;



@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: Profile | null = null;
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    selectable: true,
    plugins: [dayGridPlugin, interactionPlugin],
    height: 'auto',
    contentHeight: 600,
    select: this.onSelect.bind(this),
    events: [
      { title: 'Available', start: '2023-01-10', end: '2023-01-12' },
      { title: 'Unavailable', start: '2023-01-15' },
    ],
    eventClick: this.onEventClick.bind(this),
  };


  onSelect(selectionInfo: any): void {
    console.log('Selected range:', selectionInfo.startStr, 'to', selectionInfo.endStr);
    alert(`Selected range: ${selectionInfo.startStr} to ${selectionInfo.endStr}`);

  }


  onEventClick(info: any): void {
    console.log('Event clicked:', info.event.title);
    alert(`Event clicked: ${info.event.title}`);

  }
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    protected profileService: ProfileService
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
    console.log('Starting chat with', this.profile?.displayName);

  }

  isPricesMapNotEmpty(): boolean {
    if (!this.profile) {
      return false; // Return false if profile is null
    }
    return this.isTutorProfile(this.profile) && this.profile.prices?.length > 0;
  }

  goBackToResults(): void {
      this.router.navigate(['/profiles/search']);
    }
}

