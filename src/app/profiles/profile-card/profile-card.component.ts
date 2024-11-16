import { Component, Input } from '@angular/core';
import { TutorProfile } from '../interfaces/tutor.model';
import { StudentProfile } from '../interfaces/student.model';

type Profile = TutorProfile | StudentProfile;

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent {
  @Input() profile: Profile | null = null;
}
