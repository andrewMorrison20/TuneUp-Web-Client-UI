import { Injectable } from '@angular/core';
import sockjs from 'sockjs-client/dist/sockjs';
import { Client, StompSubscription } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private stompClient: Client;
  private messageSubjects: { [conversationId: number]: Subject<any> } = {};
  private activeSubscriptions: { [conversationId: number]: StompSubscription | null } = {};

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new sockjs('http://localhost:8080/chat-ws'),
      reconnectDelay: 5000, // Auto-reconnect after 5 seconds
      debug: (msg) => console.log('STOMP:', msg),
      onConnect: () => console.log(' Connected to WebSocket'),
      onStompError: (frame) => console.error(' STOMP Error:', frame),
      onWebSocketClose: () => console.warn(' WebSocket Disconnected'),
    });

    this.stompClient.activate(); // Start WebSocket connection
  }

  /**
   * Subscribes to a conversation WebSocket topic and listens for messages.
   * Ensures only one subscription per conversation.
   */
  public subscribeToConversation(conversationId: number): Observable<any> {
    if (!this.stompClient.connected) {
      console.error(' WebSocket is not connected!');
      return new Observable();
    }

    // Unsubscribe from any previous subscription for the same conversation
    if (this.activeSubscriptions[conversationId]) {
      this.activeSubscriptions[conversationId]?.unsubscribe();
      console.log(` Unsubscribed from previous conversation: ${conversationId}`);
    }

    // Create a new subject for this conversation
    this.messageSubjects[conversationId] = new Subject<any>();

    // Subscribe to conversation topic
    this.activeSubscriptions[conversationId] = this.stompClient.subscribe(
      `/topic/chat/${conversationId}`,
      (message) => {
        this.messageSubjects[conversationId].next(JSON.parse(message.body));
      }
    );

    console.log(` Subscribed to conversation: ${conversationId}`);

    return this.messageSubjects[conversationId].asObservable();
  }

  /**
   * Sends a message via WebSocket using `publish()`.
   */
  public sendMessage(conversationId: number, message: any): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: `/app/chat/send/${conversationId}`,
        body: JSON.stringify(message),
      });
      console.log(` Sent message to /app/chat/send/${conversationId}`);
    } else {
      console.error(' WebSocket is not connected!');
    }
  }
}

