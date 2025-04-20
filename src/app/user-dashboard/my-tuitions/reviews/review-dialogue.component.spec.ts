import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewDialogueComponent } from './review-dialogue.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {MyTuitionsModule} from "../my-tuitions.module";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('ReviewDialogueComponent', () => {
  let component: ReviewDialogueComponent;
  let fixture: ComponentFixture<ReviewDialogueComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ReviewDialogueComponent>>;
  const mockData = { tutorName: 'John Doe' };

  beforeEach(() => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [MyTuitionsModule,NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize fields', () => {
    expect(component).toBeTruthy();
    expect(component.tutorName).toBe('John Doe');
    expect(component.rating).toBe(0);
    expect(component.stars).toEqual([1, 2, 3, 4, 5]);
    expect(component.reviewTitle).toBe('');
    expect(component.reviewContent).toBe('');
  });

  it('setRating should update rating', () => {
    component.setRating(4);
    expect(component.rating).toBe(4);
  });

  it('onCancel should close the dialog without data', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  describe('onSubmitReview validation', () => {
    beforeEach(() => {
      spyOn(window, 'alert');
      dialogRefSpy.close.calls.reset();
    });

    it('should alert if rating is not set', () => {
      component.reviewTitle = 'Title';
      component.reviewContent = 'Content';
      component.rating = 0;

      component.onSubmitReview();

      expect(window.alert).toHaveBeenCalledWith(' Please complete all fields before submitting.');
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should alert if title is empty or whitespace', () => {
      component.rating = 5;
      component.reviewTitle = '   ';
      component.reviewContent = 'Some content';

      component.onSubmitReview();

      expect(window.alert).toHaveBeenCalledWith(' Please complete all fields before submitting.');
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should alert if content is empty or whitespace', () => {
      component.rating = 3;
      component.reviewTitle = 'Good Title';
      component.reviewContent = '   ';

      component.onSubmitReview();

      expect(window.alert).toHaveBeenCalledWith(' Please complete all fields before submitting.');
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });
  });

  it('onSubmitReview should close dialog with review data when valid', () => {
    component.rating = 5;
    component.reviewTitle = 'Great Tutor';
    component.reviewContent = 'Learned a lot!';

    component.onSubmitReview();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      rating: 5,
      title: 'Great Tutor',
      content: 'Learned a lot!'
    });
  });
});
