import { Component, Input, OnInit } from '@angular/core';
import { Review } from '../profiles/interfaces/review.model';
import {ProfileService} from "../profiles/profile.service";

@Component({
  selector: 'app-review-card',
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.scss'],
})
export class ReviewCardComponent implements OnInit {
  @Input() profile!: { reviews: Review[]; name: string };

  currentReviewIndex: number = 0;
  averageRating: number = 0;
  showFullText: boolean = false;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    console.log('fetching reviews for', this.profile)
    this.calculateAverageRating();
  }

  calculateAverageRating(): void {
    const ratings = this.profile.reviews.map((review) => review.rating);
    if (ratings.length > 0) {
      const total = ratings.reduce((sum, rating) => sum + rating, 0);
      this.averageRating = parseFloat((total / ratings.length).toFixed(1));
    }
  }

  prevReview(): void {
    this.currentReviewIndex =
      (this.currentReviewIndex - 1 + this.profile.reviews.length) %
      this.profile.reviews.length;
  }

  nextReview(): void {
    this.currentReviewIndex =
      (this.currentReviewIndex + 1) % this.profile.reviews.length;
  }

  get currentReview() {
    return this.profile.reviews[this.currentReviewIndex];
  }

  isTextTruncated(): boolean {
    return this.currentReview.comment.split(/\r\n|\r|\n/).length > 4;
  }

  toggleText(): void {
    this.showFullText = !this.showFullText;
  }

  getStars(): number[] {
    return [1, 2, 3, 4, 5];
  }
}
