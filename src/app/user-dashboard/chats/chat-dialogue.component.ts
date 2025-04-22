import {
  Component,
  Inject,
  OnInit,
  AfterViewChecked,
  ElementRef,
  ViewChild,
  Input,
  Optional,
  SimpleChanges
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WebsocketService } from "../../services/websocket.service";
import { Message } from "stompjs";
import { HttpClient } from "@angular/common/http";
import { AuthenticatedUser } from "../../authentication/authenticated-user.class";
import { Conversation } from "./chats.component";
import { switchMap, tap } from "rxjs/operators";
import {Observable, Subscription} from "rxjs";

@Component({
  selector: 'app-chat-dialogue',
  templateUrl: './chat-dialogue.component.html',
  styleUrls: ['./chat-dialogue.component.scss']
})
export class ChatDialogueComponent implements OnInit {
  messages: any[] = [];
  newMessage = '';
  totalMessages = 0;
  hasMoreMessages = false;
  pageIndex = 0;
  pageSize = 20;
  @Input() conversation!: Conversation;
  @Input() userProfileId!: number;
  autoScroll: boolean = true;

  @ViewChild('chatPanel') chatPanel!: ElementRef;

  private websocketSubscription?: Subscription;

  constructor(
    @Optional() public dialogRef: MatDialogRef<ChatDialogueComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private websocketService: WebsocketService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (!this.data) {
      this.data = {};
    }

    // If conversation was provided via @Input(), assign it to data.conversation
    if (!this.data.conversation && this.conversation) {
      this.data.conversation = this.conversation;
    }

    // Similarly, if userProfileId was provided via @Input(), assign it
    if (!this.data.userProfileId && this.userProfileId) {
      this.data.userProfileId = this.userProfileId;
    }

    // Initialize messages and subscription for the current conversation
    if (this.data.conversation) {
      this.initializeConversation(this.data.conversation.id);
    } else {
      this.startOrFetchConversation(this.data.userProfileId, this.data.participantId).pipe(
        tap(conversation => {
          this.data.conversation = conversation;
          this.initializeConversation(conversation.id);
        }),
        switchMap(conversation => this.fetchMessages(conversation.id))
      ).subscribe({
        error: (error) => console.error("Error fetching or starting conversation:", error)
      });
    }
  }



  ngOnChanges(changes: SimpleChanges): void {
    if (changes['conversation'] && !changes['conversation'].firstChange) {
      // Clear previous messages and reset page index
      this.messages = [];
      this.pageIndex = 0;

      // Unsubscribe from previous subscription if exists
      if (this.websocketSubscription) {
        this.websocketSubscription.unsubscribe();
      }

      // Update data with the new conversation and fetch new messages
      this.data.conversation = this.conversation;
      this.initializeConversation(this.data.conversation.id);
    }
  }

  private initializeConversation(conversationId: number): void {
    this.fetchMessages(conversationId).subscribe();
    this.subscribeToMessages(conversationId);
    setTimeout(() => this.scrollToBottom(), 0);
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

  onScroll(event: any): void {
    const nativeEl = event.target;
    const threshold = 150;
    const position = nativeEl.scrollHeight - nativeEl.scrollTop - nativeEl.clientHeight;

    // Set autoScroll to true only if near bottom, otherwise disable it.
    this.autoScroll = (position <= threshold);

    // If scrolled to top and more messages are available, fetch more.
    if (nativeEl.scrollTop === 0 && this.hasMoreMessages) {
      this.pageIndex++;
      this.fetchMessages(this.data.conversation.id, this.pageIndex, this.pageSize).subscribe();
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
