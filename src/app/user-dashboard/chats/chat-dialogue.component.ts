import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {WebsocketService} from "../../services/websocket.service";
import {Message} from "stompjs";
import {HttpClient} from "@angular/common/http";
import {Client} from "@stomp/stompjs";
import {AuthenticatedUser} from "../../authentication/authenticated-user.class";


@Component({
  selector: 'app-chat-dialogue',
  templateUrl: './chat-dialogue.component.html',
  styleUrl: './chat-dialogue.component.scss'
})
export class ChatDialogueComponent implements OnInit {
  messages: any[] = [];
  newMessage = '';
  private stompClient!: Client;

  constructor(
    public dialogRef: MatDialogRef<ChatDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private websocketService: WebsocketService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchMessages(this.data.conversation.id);
    this.websocketService.subscribeToConversation(this.data.conversation.id).subscribe((newMessage: any) => {
      this.messages.push(newMessage);
    });
  }

  fetchMessages(conversationId: number): void {
    this.http.get<Message[]>(`http://localhost:8080/api/chats/messages/${conversationId}`)
      .subscribe((data) => this.messages = data);
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

  protected readonly AuthenticatedUser = AuthenticatedUser;
}


