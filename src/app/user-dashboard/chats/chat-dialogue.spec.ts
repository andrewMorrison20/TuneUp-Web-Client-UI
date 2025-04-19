import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatDialogueComponent } from './chat-dialogue.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WebsocketService } from '../../services/websocket.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { of } from 'rxjs';

describe('ChatDialogueComponent', () => {
  let component: ChatDialogueComponent;
  let fixture: ComponentFixture<ChatDialogueComponent>;
  let httpMock: HttpTestingController;
  let mockWebsocketService: jasmine.SpyObj<WebsocketService>;

  beforeEach(async () => {
    mockWebsocketService = jasmine.createSpyObj('WebsocketService', ['subscribeToConversation', 'sendMessage']);

    await TestBed.configureTestingModule({
      declarations: [ChatDialogueComponent],
      providers: [
        { provide: WebsocketService, useValue: mockWebsocketService },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy() } },
        { provide: MAT_DIALOG_DATA, useValue: { userProfileId: 1, participantId: 2 } }
      ],
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatDialogueComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with conversation data if provided', () => {
    component.data.conversation = { id: 123 } as any;
    mockWebsocketService.subscribeToConversation.and.returnValue(of({ content: 'msg' }));
    spyOn(component as any, 'fetchMessages').and.returnValue(of({ content: [], totalElements: 0 }));

    component.ngOnInit();
    expect(component.data.conversation.id).toBe(123);
  });

  it('should initialize conversation if not provided and fetched', () => {
    spyOn(component as any, 'initializeConversation').and.stub();
    spyOn(component as any, 'fetchMessages').and.returnValue(of({ content: [], totalElements: 0 }));

    component.ngOnInit();
    const req = httpMock.expectOne('http://localhost:8080/api/chats/conversation/start');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 42 });
  });

  it('should fetch messages on scroll to top if hasMoreMessages is true', () => {
    const fakeEvent = {
      target: {
        scrollTop: 0,
        scrollHeight: 500,
        scrollTopMax: 500,
        clientHeight: 100
      }
    };
    component.hasMoreMessages = true;
    component.pageIndex = 0;
    component.data.conversation = { id: 123 } as any;
    spyOn(component, 'fetchMessages').and.returnValue(of({ content: [], totalElements: 0 }));

    component.onScroll(fakeEvent);
    expect(component.pageIndex).toBe(1);
  });

  it('should update messages and flags from fetchMessages()', () => {
    const dummyMessages = [ { body: 'Hello' } as any ];
    component.fetchMessages(1).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/chats/conversation/1/messages?page=0&size=20');
    req.flush({ content: dummyMessages, totalElements: 100 });

    expect(component.messages.length).toBeGreaterThan(0);
    expect(component.totalMessages).toBe(100);
  });

  it('should call sendMessage if message is not empty', () => {
    component.newMessage = 'Hello';
    component.data.conversation = { id: 1 };
    component.data.userProfileId = 1;

    component.sendMessage();
    expect(mockWebsocketService.sendMessage).toHaveBeenCalled();
    expect(component.newMessage).toBe('');
  });

  it('should not send empty messages', () => {
    component.newMessage = '   ';
    component.sendMessage();
    expect(mockWebsocketService.sendMessage).not.toHaveBeenCalled();
  });

  it('should return true if two timestamps are same day', () => {
    const t1 = new Date().toISOString();
    const t2 = new Date().toISOString();
    expect(component.isSameDay(t1, t2)).toBeTrue();
  });

  it('should close dialog on close()', () => {
    component.close();
    expect((component.dialogRef as MatDialogRef<ChatDialogueComponent>).close).toHaveBeenCalled();
  });

  it('should re-initialize on conversation @Input() change', () => {
    spyOn<any>(component, 'initializeConversation');
    component.data = {};

    component.conversation = { id: 5 } as any;
    (component as any).ngOnChanges({
      conversation: new SimpleChange(null, component.conversation, false)
    });

    expect((component as any).initializeConversation).toHaveBeenCalledWith(5);
  });


  it('should scroll to bottom if autoScroll is true', () => {
    component.autoScroll = true;
    component.chatPanel = {
      nativeElement: {
        scrollTop: 0,
        scrollHeight: 500
      }
    } as any;
    component.ngAfterViewChecked();
    expect(component.chatPanel.nativeElement.scrollTop).toBe(500);
  });

  it('should assign @Input() values to data if data is missing', () => {
    component.data = undefined as any;
    component.conversation = { id: 99 } as any;
    component.userProfileId = 123;

    spyOn<any>(component, 'initializeConversation').and.stub();
    spyOn<any>(component, 'fetchMessages').and.returnValue(of({ content: [], totalElements: 0 }));
    mockWebsocketService.subscribeToConversation.and.returnValue(of({}));

    component.ngOnInit();

    expect(component.data.conversation.id).toBe(99);
    expect(component.data.userProfileId).toBe(123);
  });
});
