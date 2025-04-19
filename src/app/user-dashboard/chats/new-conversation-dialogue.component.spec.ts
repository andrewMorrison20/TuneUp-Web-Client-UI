import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { NewConversationDialogueComponent } from './new-conversation-dialogue.component';
import { TuitionsService } from '../my-tuitions/tuitions.service';
import { AuthenticatedUser } from '../../authentication/authenticated-user.class';
import {SharedModule} from "../../shared/shared.module";

describe('NewConversationDialogueComponent', () => {
  let component: NewConversationDialogueComponent;
  let fixture: ComponentFixture<NewConversationDialogueComponent>;
  let tuitionsServiceSpy: jasmine.SpyObj<TuitionsService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<NewConversationDialogueComponent>>;

  beforeEach(() => {
    // Spy on AuthenticatedUser static method
    spyOn(AuthenticatedUser, 'getAuthUserProfileId').and.returnValue(123);

    tuitionsServiceSpy = jasmine.createSpyObj('TuitionsService', ['fetchTuitionsNoChatHistory']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,SharedModule],
      declarations: [NewConversationDialogueComponent],
      providers: [
        { provide: TuitionsService, useValue: tuitionsServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewConversationDialogueComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call fetchProfilesWithNoChat', () => {
      spyOn(component, 'fetchProfilesWithNoChat');
      component.ngOnInit();
      expect(component.fetchProfilesWithNoChat).toHaveBeenCalledWith();
    });
  });

  describe('fetchProfilesWithNoChat', () => {
    const mockResponse = { content: [{ id: 1 }], totalElements: 10 } as any;

    it('should load profiles successfully', () => {
      tuitionsServiceSpy.fetchTuitionsNoChatHistory.and.returnValue(of(mockResponse));
      component.fetchProfilesWithNoChat(2, 8, false);

      expect(AuthenticatedUser.getAuthUserProfileId).toHaveBeenCalled();
      expect(tuitionsServiceSpy.fetchTuitionsNoChatHistory)
        .toHaveBeenCalledWith(123, 2, 8, false);
      expect(component.profiles).toEqual(mockResponse.content);
      expect(component.totalElements).toBe(10);
      expect(component.isLoading).toBeFalse();
    });

    it('should handle error and stop loading', () => {
      spyOn(console, 'error');
      tuitionsServiceSpy.fetchTuitionsNoChatHistory.and.returnValue(throwError(() => new Error('fail')));

      component.fetchProfilesWithNoChat();

      expect(console.error).toHaveBeenCalledWith('Error fetching profiles:', jasmine.anything());
      expect(component.isLoading).toBeFalse();
      expect(component.profiles).toEqual([]);
      expect(component.totalElements).toBe(0);
    });
  });

  describe('selectProfile', () => {
    it('should set selectedProfileId', () => {
      expect(component.selectedProfileId).toBeNull();
      component.selectProfile({ id: 42 });
      expect(component.selectedProfileId).toBe(42);
    });
  });

  describe('startConversation', () => {
    it('should close dialog with selectedProfileId', () => {
      component.selectedProfileId = 55;
      component.startConversation();
      expect(dialogRefSpy.close).toHaveBeenCalledWith(55);
    });

    it('should close dialog with null if none selected', () => {
      component.selectedProfileId = null;
      component.startConversation();
      expect(dialogRefSpy.close).toHaveBeenCalledWith(null);
    });
  });

  describe('onPageChange', () => {
    it('should update pageSize and pageIndex', () => {
      const event: PageEvent = { pageIndex: 3, pageSize: 7, length: 0 };
      component.pageIndex = 0;
      component.pageSize = 5;

      component.onPageChange(event);

      expect(component.pageIndex).toBe(3);
      expect(component.pageSize).toBe(7);
    });
  });
});
