import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';


import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { NewConversationDialogueComponent } from './new-conversation-dialogue.component';
import { ChatDialogueComponent } from './chat-dialogue.component';
import {ChatsComponent, Conversation, ConversationParticipantDto} from "./chats.component";
import {SharedModule} from "../../shared/shared.module";

class MatDialogRefMock {
  afterClosed() {
    return of(null);
  }
}

describe('ChatsComponent', () => {
  let component: ChatsComponent;
  let fixture: ComponentFixture<ChatsComponent>;
  let httpMock: HttpTestingController;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let breakpointsSubject: BehaviorSubject<BreakpointState>;
  let breakpointObserverStub: Partial<BreakpointObserver>;

  beforeEach(() => {
    // Stub BreakpointObserver with controllable BehaviorSubject
    breakpointsSubject = new BehaviorSubject<BreakpointState>({ matches: false, breakpoints: {} });
    breakpointObserverStub = {
      observe: jasmine.createSpy('observe').and.returnValue(breakpointsSubject.asObservable())
    };

    // Spy for MatDialog
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue(new MatDialogRefMock() as MatDialogRef<any>);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,SharedModule],
      declarations: [ChatsComponent],
      providers: [
        { provide: MatDialog, useValue: dialogSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should subscribe to breakpoint observer and fetch conversations', () => {
    spyOn(component, 'fetchConversations');
    // Simulate breakpoint matching
    breakpointsSubject.next({ matches: true, breakpoints: {} });

    component.ngOnInit();

    expect(breakpointObserverStub.observe).toHaveBeenCalledWith(['(max-width: 1200px)']);
    expect(component.isMobile).toBeTrue();
    expect(component.fetchConversations).toHaveBeenCalled();
  });

  describe('fetchConversations', () => {
    const mockConversations: Conversation[] = [
      { id: 1, participants: [], lastMessage: 'hello', lastMessageTimestamp: '2021-01-01T00:00:00Z' }
    ];
    it('should populate conversations and select first on desktop', () => {
      component.isMobile = false;
      component.fetchConversations();

      const req = httpMock.expectOne(
        `http://localhost:8080/api/chats/conversations/${component.userProfileId}?page=${component.pageIndex}&size=${component.pageSize}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({ content: mockConversations, totalElements: 5 });

      expect(component.isLoading).toBeFalse();
      expect(component.conversations).toEqual(mockConversations);
      expect(component.totalElements).toBe(5);
      expect(component.selectedConversation).toEqual(mockConversations[0]);
    });

    it('should populate conversations but not select on mobile', () => {
      component.isMobile = true;
      component.fetchConversations();

      const req = httpMock.expectOne(
        `http://localhost:8080/api/chats/conversations/${component.userProfileId}?page=${component.pageIndex}&size=${component.pageSize}`
      );
      req.flush({ content: mockConversations, totalElements: 2 });

      expect(component.isLoading).toBeFalse();
      expect(component.conversations).toEqual(mockConversations);
      expect(component.totalElements).toBe(2);
      expect(component.selectedConversation).toBeNull();
    });

    it('should handle error and stop loading', () => {
      component.isLoading = true;
      spyOn(console, 'error');

      component.fetchConversations();
      const req = httpMock.expectOne(
        `http://localhost:8080/api/chats/conversations/${component.userProfileId}?page=${component.pageIndex}&size=${component.pageSize}`
      );
      req.error(new ErrorEvent('Network error'));

      expect(console.error).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('openChatDialog', () => {
    it('should open chat dialog and subscribe afterClosed', () => {
      const conversation: Conversation = { id: 2, participants: [], lastMessage: '', lastMessageTimestamp: '' };
      spyOn(console, 'log');

      component.openChatDialog(conversation);

      expect(dialogSpy.open).toHaveBeenCalledWith(ChatDialogueComponent, jasmine.objectContaining({ data: jasmine.objectContaining({ conversation, userProfileId: component.userProfileId }) }));
      // afterClosed logs
      expect(console.log).toHaveBeenCalledWith('Chat dialog closed.');
    });
  });

  describe('selectConversation', () => {
    const conversation: Conversation = { id: 3, participants: [], lastMessage: '', lastMessageTimestamp: '' };

    it('should open dialog on mobile', () => {
      component.isMobile = true;
      spyOn(component, 'openChatDialog');

      component.selectConversation(conversation);

      expect(component.openChatDialog).toHaveBeenCalledWith(conversation);
      expect(component.selectedConversation).toBeNull();
    });

    it('should set selectedConversation on desktop', () => {
      component.isMobile = false;

      component.selectConversation(conversation);

      expect(component.selectedConversation).toEqual(conversation);
    });
  });

  it('onPageChange should update paging and fetch conversations', () => {
    spyOn(component, 'fetchConversations');
    const pageEvent: PageEvent = { pageIndex: 1, pageSize: 10, length: 0 };

    component.onPageChange(pageEvent);

    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(10);
    expect(component.fetchConversations).toHaveBeenCalled();
  });

  describe('openNewConversationDialog', () => {
    it('should open new conversation dialog and not start if no selection', fakeAsync(() => {
      dialogSpy.open.and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<any>);
      spyOn(component, 'startNewConversation');

      component.profiles = [];
      component.openNewConversationDialog();
      tick();

      expect(dialogSpy.open).toHaveBeenCalledWith(NewConversationDialogueComponent, jasmine.any(Object));
      expect(component.startNewConversation).not.toHaveBeenCalled();
    }));

    it('should start new conversation when selection made', fakeAsync(() => {
      dialogSpy.open.and.returnValue({ afterClosed: () => of(42) } as MatDialogRef<any>);
      spyOn(component, 'startNewConversation');

      component.profiles = [];
      component.openNewConversationDialog();
      tick();

      expect(component.startNewConversation).toHaveBeenCalledWith(42);
    }));
  });

  describe('startNewConversation', () => {
    const profileId = 99;
    const url = 'http://localhost:8080/api/chats/conversation/start';

    it('should post and fetch conversations on success', () => {
      spyOn(component, 'fetchConversations');

      component.startNewConversation(profileId);
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ userId: component.userProfileId, participantId: profileId });

      req.flush({});

      expect(component.fetchConversations).toHaveBeenCalled();
    });

    it('should log error on failure', () => {
      spyOn(console, 'error');

      component.startNewConversation(profileId);
      const req = httpMock.expectOne(url);
      req.error(new ErrorEvent('Error'));

      expect(console.error).toHaveBeenCalledWith('Error starting conversation:', jasmine.anything());
    });
  });

  describe('getOtherParticipant', () => {
    it('should return the other participant', () => {
      const participants: ConversationParticipantDto[] = [
        { id: 1, displayName: 'Alice', profilePictureUrl: null },
        { id: 2, displayName: 'Bob', profilePictureUrl: null }
      ];

      const result = component.getOtherParticipant(participants, 1);
      expect(result).toEqual(participants[1]);
    });

    it('should return undefined if no other participant', () => {
      const participants: ConversationParticipantDto[] = [
        { id: 1, displayName: 'Alice', profilePictureUrl: null }
      ];

      const result = component.getOtherParticipant(participants, 1);
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty array', () => {
      const result = component.getOtherParticipant([], 123);
      expect(result).toBeUndefined();
    });
  });
});
