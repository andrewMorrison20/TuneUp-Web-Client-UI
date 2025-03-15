import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { PageEvent } from '@angular/material/paginator';
import { tap, catchError } from 'rxjs/operators';
import {EMPTY, throwError} from 'rxjs';
import {TutorProfile} from "../../profiles/interfaces/tutor.model";
import {StudentProfile} from "../../profiles/interfaces/student.model";
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";
import {TuitionsService} from "../my-tuitions/tuitions.service";

type Profile = TutorProfile | StudentProfile
@Component({
  selector: 'app-new-conversation-dialogue',
  templateUrl: './new-conversation-dialogue.component.html',
})
export class NewConversationDialogueComponent implements OnInit {
  profiles: Profile[] = [];
  selectedProfileId: number | null = null;
  isLoading = true;
  totalElements = 0;
  pageSize = 5;
  pageIndex = 0;
  defaultProfileImage = 'https://example.com/default-avatar.png';

  constructor(
    public dialogRef: MatDialogRef<NewConversationDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private tuitionsService: TuitionsService
  ) {}

  ngOnInit(): void {
    this.fetchProfilesWithNoChat();
  }

  /**
   * Gets the set of profiles in active tuition with user profile and no existing chat history
   */

  fetchProfilesWithNoChat(page: number = 0, size: number = 10, active: boolean = true) {
    this.isLoading = true;
    const profileId = AuthenticatedUser.getAuthUserProfileId();

    this.tuitionsService.fetchTuitionsNoChatHistory(profileId, page, size, active)
      .pipe(
        tap(response => {
          this.profiles = response.content;
          this.totalElements = response.totalElements;
          this.isLoading = false;
        }),
        catchError(error => {
          console.error('Error fetching profiles:', error);
          this.isLoading = false;
          return EMPTY;
        })
      )
      .subscribe();
  }

  selectProfile(profile: any): void {
    this.selectedProfileId = profile.id;
  }

  startConversation(): void {
    this.dialogRef.close(this.selectedProfileId);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }
}

