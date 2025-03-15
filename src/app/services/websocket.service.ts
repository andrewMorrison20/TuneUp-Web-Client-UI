import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, over } from 'stompjs';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: Client | null = null;
  private messageSubject = new Subject<string>();

  constructor() {
    this.connect();
  }

  private connect(): void {
    const socket = new SockJS('http://localhost:8080/chat-ws');
    this.stompClient = over(socket);

    this.stompClient.connect({}, () => {
      console.log('Connected to WebSocket');
      this.stompClient?.subscribe('/topic/messages', (message) => {
        this.messageSubject.next(message.body);
      });
    });
  }

  public getMessages(): Observable<string> {
    return this.messageSubject.asObservable();
  }

  public sendMessage(destination: string, message: any): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send(destination, {}, JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }
}
