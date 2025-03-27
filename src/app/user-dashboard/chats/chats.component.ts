import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {PageEvent} from "@angular/material/paginator";

import {MatDialog} from "@angular/material/dialog";
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";
import {tap} from "rxjs/operators";
import {catchError, EMPTY} from "rxjs";
import {TutorProfile} from "../../profiles/interfaces/tutor.model";
import {StudentProfile} from "../../profiles/interfaces/student.model";
import {NewConversationDialogueComponent} from "./new-conversation-dialogue.component";
import {ChatDialogueComponent} from "./chat-dialogue.component";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
type Profile = TutorProfile | StudentProfile;

export interface Conversation {
  id: number;
  participants: ConversationParticipantDto[];
  lastMessage: string;
  lastMessageTimestamp:string;
}

export interface Message {
  sender: string;
  content: string;
  timestamp: string;
  senderName: string;
  senderProfilePictureUrl:string
}

interface ConversationParticipantDto {
  id: number;
  displayName: string;
  profilePictureUrl: string | null;
}

@Component({
  selector: 'app-chat-list',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss'],
})
export class ChatsComponent implements OnInit {
  protected readonly AuthenticatedUser = AuthenticatedUser;
  userProfileId = AuthenticatedUser.getAuthUserProfileId();
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  isLoading = true;
  totalElements = 0;
  pageSize = 5;
  pageIndex = 0;
  profiles:Profile[] = []
  isMobile: boolean = false;


  constructor(private http: HttpClient,
              public dialog: MatDialog,
              private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.breakpointObserver.observe(['(max-width: 1200px)']).subscribe(result => {
      this.isMobile = result.matches;
    });
    this.fetchConversations();
  }

  fetchConversations(): void {
    this.isLoading = true;

    this.http.get<{ content: Conversation[], totalElements: number }>(
      `http://localhost:8080/api/chats/conversations/${this.userProfileId}?page=${this.pageIndex}&size=${this.pageSize}`
    ).pipe(
      tap((data) => {
        this.conversations = data.content;
        this.totalElements = data.totalElements;
        this.isLoading = false;
        if (this.conversations.length > 0 && !this.isMobile) {
          this.selectedConversation = this.conversations[0];
        }
        console.log('Conversations:', this.conversations);
      }),
      catchError((error) => {
        console.error('Error fetching conversations:', error);
        this.isLoading = false; // Ensures spinner stops even on error
        return EMPTY; // Prevents further execution of subscription
      })
    ).subscribe();
  }

  openChatDialog(conversation: Conversation): void {
    const dialogRef = this.dialog.open(ChatDialogueComponent, {
      width: '600px',
      data: {
        conversation: conversation,
        userProfileId: this.userProfileId,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('Chat dialog closed.');
    });
  }

  selectConversation(conversation: Conversation): void {
    if (this.isMobile) {
      // On mobile: open chat in dialog
      this.openChatDialog(conversation);
    } else {
      // On desktop: render chat inline
      this.selectedConversation = conversation;
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.fetchConversations();
  }

  openNewConversationDialog(): void {
    const dialogRef = this.dialog.open(NewConversationDialogueComponent, {
      width: '400px',
      data: { profiles :this.profiles }
    });

    dialogRef.afterClosed().subscribe((selectedProfileId) => {
      console.log('Starting conversation with : ' ,selectedProfileId);
      if (selectedProfileId) {
        this.startNewConversation(selectedProfileId);
      }
    });
  }

  startNewConversation(profileId: number): void {
    const url = `http://localhost:8080/api/chats/conversation/start`;

    const requestBody = {
      userId: this.userProfileId, // Logged-in user
      participantId: profileId, // Selected profile
    };

    this.http.post(url, requestBody).subscribe(
      () => {
        // Instead of modifying local state, fetch fresh data from the backend
        this.fetchConversations();
      },
      (error) => {
        console.error('Error starting conversation:', error);
      }
    );
  }


 getOtherParticipant(
  participants: ConversationParticipantDto[],
  currentUserProfileId: number): ConversationParticipantDto | undefined {
   return participants.find(participant => participant.id !== currentUserProfileId);
 }
}
