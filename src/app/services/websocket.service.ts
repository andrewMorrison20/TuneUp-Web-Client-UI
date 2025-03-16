import { Injectable } from '@angular/core';
import sockjs from "sockjs-client/dist/sockjs"
import { Client } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: Client;
  private messageSubjects: { [conversationId: string]: Subject<any> } = {};

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new sockjs('http://localhost:8080/chat-ws'),
      reconnectDelay: 5000, // Auto-reconnect after 5s
      debug: (msg) => console.log('STOMP:', msg),
      onConnect: () => console.log(' Connected to WebSocket'),
      onStompError: (frame) => console.error(' STOMP Error:', frame),
      onWebSocketClose: () => console.warn('⚠ WebSocket Disconnected'),
    });

    this.stompClient.activate(); // Start WebSocket connection
  }

  public subscribeToConversation(conversationId: number): Observable<any> {
    if (!this.messageSubjects[conversationId]) {
      this.messageSubjects[conversationId] = new Subject<any>();

      this.stompClient.subscribe(`/topic/chat/${conversationId}`, (message) => {
        this.messageSubjects[conversationId].next(JSON.parse(message.body));
      });

      console.log(` Subscribed to conversation: ${conversationId}`);
    }

    return this.messageSubjects[conversationId].asObservable();
  }

  public sendMessage(conversationId: number, message: any): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: `/app/chat/send/${conversationId}`,
        body: JSON.stringify(message),
      });
    } else {
      console.error(' WebSocket is not connected!');
    }
  }
}
