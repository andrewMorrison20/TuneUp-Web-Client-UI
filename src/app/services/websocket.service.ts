import { Injectable } from '@angular/core';
import sockjs from 'sockjs-client/dist/sockjs';
import { Client, StompSubscription } from '@stomp/stompjs';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {AuthenticatedUser} from "../authentication/authenticated-user.class";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private stompClient: Client;
  private messageSubjects: { [conversationId: number]: Subject<any> } = {};
  private activeSubscriptions: { [conversationId: number]: StompSubscription | null } = {};
  private url = environment.url;

  private connected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new sockjs(`${this.url}/chat-ws`),
      reconnectDelay: 5000,
      debug: (msg) => console.log('STOMP:', msg),
      onConnect: () => {
        console.log('Connected to WebSocket');
        this.connected$.next(true);
      },
      onStompError: (frame) => console.error('STOMP Error:', frame),
      onWebSocketClose: () => {
        console.warn('WebSocket Disconnected');
        this.connected$.next(false);
      },
    });
  }

  public init(): void {
    this.stompClient.activate();
  }

  /**
   * Subscribes to a conversation WebSocket topic and listens for messages.
   * Ensures only one subscription per conversation.
   */
  public subscribeToConversation(conversationId: number): Observable<any> {
    if (!this.stompClient.connected) {
      console.error('WebSocket is not connected!');
      return new Observable();
    }

    if (this.activeSubscriptions[conversationId]) {
      this.activeSubscriptions[conversationId]?.unsubscribe();
      console.log(`Unsubscribed from previous conversation: ${conversationId}`);
    }

    this.messageSubjects[conversationId] = new Subject<any>();

    this.activeSubscriptions[conversationId] = this.stompClient.subscribe(
      `/topic/chat/${conversationId}`,
      (message) => {
        this.messageSubjects[conversationId].next(JSON.parse(message.body));
      }
    );

    console.log(`Subscribed to conversation: ${conversationId}`);
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
      console.log(`Sent message to /app/chat/send/${conversationId}`);
    } else {
      console.error('WebSocket is not connected!');
    }
  }

  /**
   * Subscribes to notifications. Waits until connection is established.
   */
  public subscribeToNotifications(): Observable<any> {
    const notificationSubject = new Subject<any>();
    const userId = AuthenticatedUser.getAuthUserId();

    this.connected$.subscribe((isConnected) => {
      if (isConnected) {
        this.stompClient.subscribe(`/user/${userId}/queue/notifications`, (message) => {
          notificationSubject.next(JSON.parse(message.body));
        });
        console.log('Subscribed to notifications');
      }
    });

    return notificationSubject.asObservable();
  }
}


