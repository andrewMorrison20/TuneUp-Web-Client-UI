import { Component, Inject, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WebsocketService } from "../../services/websocket.service";
import { Message } from "stompjs";
import { HttpClient } from "@angular/common/http";
import { Client } from "@stomp/stompjs";
import { AuthenticatedUser } from "../../authentication/authenticated-user.class";
import { Conversation } from "./chats.component";
import { switchMap, tap } from "rxjs/operators";
import { Observable } from "rxjs";

@Component({
  selector: 'app-chat-dialogue',
  templateUrl: './chat-dialogue.component.html',
  styleUrls: ['./chat-dialogue.component.scss']
})
export class ChatDialogueComponent implements OnInit, AfterViewChecked {
  messages: any[] = [];
  newMessage = '';
  totalMessages = 0;
  hasMoreMessages = false;
  pageIndex = 0;
  pageSize = 20;
  private stompClient!: Client;

  @ViewChild('chatPanel') chatPanel!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<ChatDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private websocketService: WebsocketService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (this.data.conversation) {
      this.fetchMessages(this.data.conversation.id).subscribe();
      this.subscribeToMessages(this.data.conversation.id);
    } else {
      this.startOrFetchConversation(this.data.userProfileId, this.data.participantId).pipe(
        tap(conversation => {
          this.data.conversation = conversation;
          this.subscribeToMessages(conversation.id);
        }),
        switchMap(conversation => this.fetchMessages(conversation.id))
      ).subscribe({
        error: (error) => console.error("Error fetching or starting conversation:", error)
      });
    }
  }

  ngAfterViewChecked(): void {
    if (this.isUserNearBottom()) {
      this.scrollToBottom();
    }
  }

  private isUserNearBottom(): boolean {
    const nativeEl = this.chatPanel.nativeElement;
    const threshold = 150; // pixels from the bottom
    const position = nativeEl.scrollHeight - nativeEl.scrollTop - nativeEl.clientHeight;
    return position <= threshold;
  }

  private scrollToBottom(): void {
    if (this.chatPanel && this.chatPanel.nativeElement) {
      this.chatPanel.nativeElement.scrollTop = this.chatPanel.nativeElement.scrollHeight;
    }
  }

  subscribeToMessages(conversationId: number): void {
    this.websocketService.subscribeToConversation(conversationId).subscribe((newMessage: any) => {
      this.messages.push(newMessage);
    });
  }

  startOrFetchConversation(userProfileId: number, participantId: number) {
    return this.http.post<Conversation>(
      `http://localhost:8080/api/chats/conversation/start`,
      { userId: userProfileId, participantId: participantId }
    );
  }

  fetchMessages(conversationId: number, pageIndex: number = 0, pageSize: number = 20): Observable<{ content: Message[], totalElements: number }> {
    const token = AuthenticatedUser.getAuthUserToken();
    const url = `http://localhost:8080/api/chats/conversation/${conversationId}/messages?page=${pageIndex}&size=${pageSize}`;

    return this.http.get<{ content: Message[], totalElements: number }>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(response => {
        this.messages = [...response.content, ...this.messages];
        this.totalMessages = response.totalElements;
        this.hasMoreMessages = response.content.length === pageSize;
      })
    );
  }

  onScroll(event: any): void {
    const scrollTop = event.target.scrollTop;
    if (scrollTop === 0 && this.hasMoreMessages) {
      this.pageIndex++;
      this.fetchMessages(this.data.conversation.id, this.pageIndex, this.pageSize).subscribe();
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;
    const message = {
      senderProfileId: this.data.userProfileId,
      conversationId: this.data.conversation.id,
      content: this.newMessage
    };
    this.websocketService.sendMessage(this.data.conversation.id, message);
    this.newMessage = '';
  }

  close(): void {
    this.dialogRef.close();
  }

  isSameDay(timestamp1: string, timestamp2: string): boolean {
    const date1 = new Date(timestamp1).setHours(0, 0, 0, 0);
    const date2 = new Date(timestamp2).setHours(0, 0, 0, 0);
    return date1 === date2;
  }

  protected readonly AuthenticatedUser = AuthenticatedUser;
}
