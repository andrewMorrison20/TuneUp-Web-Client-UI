// websocket.service.spec.ts
import { WebsocketService } from './websocket.service';
import { AuthenticatedUser } from '../authentication/authenticated-user.class';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Subject } from 'rxjs';

describe('WebsocketService', () => {
  let service: WebsocketService;
  let mockStompClient: jasmine.SpyObj<Client>;

  beforeEach(() => {
    mockStompClient = jasmine.createSpyObj('Client', [
      'activate', 'subscribe', 'publish'
    ], {
      connected: true
    });

    service = new WebsocketService();
    (service as any).stompClient = mockStompClient; // force inject mock client
  });

  it('should initialize and activate WebSocket', () => {
    const newService = new WebsocketService();
    expect(newService).toBeTruthy();
  });

  it('should receive a message from subscribed conversation', (done) => {
    const conversationId = 123;
    let callbackFn: any;

    const mockStompClient = {
      connected: true,
      subscribe: jasmine.createSpy().and.callFake((_topic, callback) => {
        callbackFn = callback;
        return { unsubscribe: jasmine.createSpy() };
      }),
      publish: jasmine.createSpy()
    };

    const service = new WebsocketService();
    (service as any).stompClient = mockStompClient;

    const testMessage = { content: 'test' };

    service.subscribeToConversation(conversationId).subscribe((msg) => {
      expect(msg).toEqual(testMessage);
      done();
    });

    // simulate receiving a message
    callbackFn({ body: JSON.stringify(testMessage) });
  });


  it('should unsubscribe if already subscribed to a conversation', () => {
    const mockSub: StompSubscription = { id: '1', unsubscribe: jasmine.createSpy() };
    mockStompClient.subscribe.and.returnValue(mockSub);

    service.subscribeToConversation(999); // first time
    service.subscribeToConversation(999); // triggers unsubscribe

    expect(mockSub.unsubscribe).toHaveBeenCalled();
  });

  it('should log an error if WebSocket is not connected', () => {
    const mockStompClient = {
      connected: false,
      subscribe: jasmine.createSpy(),
      publish: jasmine.createSpy()
    };

    const service = new WebsocketService();
    (service as any).stompClient = mockStompClient;

    spyOn(console, 'error');

    service.subscribeToConversation(999);

    expect(console.error).toHaveBeenCalledWith('WebSocket is not connected!');
  });


  it('should publish message if connected', () => {
    const message = { text: 'hello' };
    service.sendMessage(42, message);
    expect(mockStompClient.publish).toHaveBeenCalledWith({
      destination: '/app/chat/send/42',
      body: JSON.stringify(message)
    });
  });

  it('should not publish message if not connected', () => {
    const mockStompClient = {
      connected: false,
      publish: jasmine.createSpy()
    };

    const service = new WebsocketService();
    (service as any).stompClient = mockStompClient;

    spyOn(console, 'error');

    service.sendMessage(42, { text: 'fail' });

    expect(console.error).toHaveBeenCalledWith('WebSocket is not connected!');
    expect(mockStompClient.publish).not.toHaveBeenCalled();
  });


  it('should subscribe to notifications after connection', () => {
    spyOn(AuthenticatedUser, 'getAuthUserId').and.returnValue(7);

    const notifications$: Subject<any> = service.subscribeToNotifications() as any;
    const testMessage = { body: JSON.stringify({ note: 'notify' }) } as IMessage;

    mockStompClient.subscribe.and.callFake((_dest, cb) => {
      cb(testMessage);
      return { id: 'sub', unsubscribe: () => {} };
    });

    (service as any).connected$.next(true); // simulate connection established

    notifications$.subscribe((msg) => {
      expect(msg).toEqual({ note: 'notify' });
    });
  });

  it('should call onConnect and emit true', (done) => {
    spyOn(console, 'log');
    const service = new WebsocketService();
    let seen = 0;

    service['connected$'].subscribe((val: boolean) => {
      seen++;
      if (seen === 2) {               // the second emission is the 'true'
        expect(val).toBeTrue();
        done();
      }
    });

    (service as any).stompClient.onConnect();
    expect(console.log).toHaveBeenCalledWith('Connected to WebSocket');
  });
  
  it('should handle stomp error', () => {
    spyOn(console, 'error');
    const service = new WebsocketService();
    const errorFrame = { headers: {}, body: 'test error' };
    (service as any).stompClient.onStompError(errorFrame);

    expect(console.error).toHaveBeenCalledWith('STOMP Error:', errorFrame);
  });

  it('should handle websocket close', () => {
    spyOn(console, 'warn');
    const service = new WebsocketService();
    (service as any).stompClient.onWebSocketClose();

    service['connected$'].subscribe((val) => {
      expect(val).toBeFalse();
    });

    expect(console.warn).toHaveBeenCalledWith('WebSocket Disconnected');
  });

});
