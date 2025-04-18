import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewCardComponent } from './review-card.component';
import {ProfileModule} from "../profiles/profile.module";

const stubProfile = {
  name: 'Jane',
  reviews: [
    { rating: 5, comment: 'Great!\nLine2' } as any,
    { rating: 4, comment: 'Good lesson.\nLine2\nLine3\nLine4\nLine5\nLine6' } as any,
  ],
};

describe('ReviewCardComponent', () => {
  let fixture: ComponentFixture<ReviewCardComponent>;
  let comp: ReviewCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[ProfileModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewCardComponent);
    comp     = fixture.componentInstance;
    comp.profile = stubProfile;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  it('starts at index 0 and returns the first review', () => {
    expect(comp.currentReviewIndex).toBe(0);
    expect(comp.currentReview.comment).toContain('Great!');
  });

  it('nextReview wraps to 0 after the last review', () => {
    comp.currentReviewIndex = 1; // last
    comp.nextReview();
    expect(comp.currentReviewIndex).toBe(0);
  });

  it('prevReview wraps to last index when on first review', () => {
    comp.currentReviewIndex = 0;
    comp.prevReview();
    expect(comp.currentReviewIndex).toBe(1);
  });

  it('isTextTruncated detects comments over four lines', () => {
    comp.currentReviewIndex = 1;     // 6‑line comment
    expect(comp.isTextTruncated()).toBeTrue();
    comp.currentReviewIndex = 0;     // 2‑line comment
    expect(comp.isTextTruncated()).toBeFalse();
  });

  it('toggleText flips the flag', () => {
    expect(comp.showFullText).toBeFalse();
    comp.toggleText();
    expect(comp.showFullText).toBeTrue();
    comp.toggleText();
    expect(comp.showFullText).toBeFalse();
  });
});
