import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import SockJS from 'sockjs-client';
import {Client} from "stompjs";
import {PageEvent} from "@angular/material/paginator";

import {MatDialog} from "@angular/material/dialog";
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";
import {tap} from "rxjs/operators";
import {catchError, EMPTY} from "rxjs";
import {TuitionsService} from "../my-tuitions/tuitions.service";
import {TutorProfile} from "../../profiles/interfaces/tutor.model";
import {StudentProfile} from "../../profiles/interfaces/student.model";
import {NewConversationDialogueComponent} from "./new-conversation-dialogue.component";
type Profile = TutorProfile | StudentProfile;

interface Conversation {
  id: number;
  participants: string[]; // Usernames
}

interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

@Component({
  selector: 'app-chat-list',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss'],
})
export class ChatsComponent implements OnInit {
  userId = 1; // Mocked user ID (Replace with actual auth logic)
  conversations: Conversation[] = [];
  messages: Message[] = [];
  selectedConversation: Conversation | null = null;
  newMessage: string = '';
  isLoading = true;
  totalElements = 0;
  pageSize = 5;
  pageIndex = 0;
  profiles:Profile[] = []

  private stompClient!: Client;

  constructor(private http: HttpClient,public dialog: MatDialog, private tuitionsService:TuitionsService) {}

  ngOnInit(): void {
    this.fetchConversations();
  }

  fetchConversations(): void {
    this.isLoading = true;
    this.http.get<{ conversations: Conversation[], totalElements: number }>(
      `http://localhost:8080/api/chat/conversations/${this.userId}?page=${this.pageIndex}&size=${this.pageSize}`
    ).subscribe((data) => {
      this.conversations = data.conversations;
      this.totalElements = data.totalElements;
      this.isLoading = false;
    });
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.fetchMessages(conversation.id);
  }

  fetchMessages(conversationId: number): void {
    this.http.get<Message[]>(`http://localhost:8080/api/chat/messages/${conversationId}`)
      .subscribe((data) => this.messages = data);
  }

  sendMessage(): void {
    if (!this.selectedConversation || !this.newMessage.trim()) return;

    const message = {
      senderId: this.userId,
      conversationId: this.selectedConversation.id,
      content: this.newMessage
    };

    this.http.post(`http://localhost:8080/api/chat/send`, message)
      .subscribe(() => this.newMessage = '');
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

    dialogRef.afterClosed().subscribe((selectedStudentId) => {
      if (selectedStudentId) {
        this.startNewConversation(selectedStudentId);
      }
    });
  }

  startNewConversation(studentId: number): void {
   // this.chatService.createConversation(studentId).subscribe((newConvo) => {
    //  this.conversations.push(newConvo);
     // this.selectConversation(newConvo);
   // });
  }
}
