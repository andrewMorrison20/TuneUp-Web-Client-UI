import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-review-dialog',
  templateUrl: './review-dialogue.component.html',
  styleUrls: ['./review-dialogue.component.scss']
})
export class ReviewDialogueComponent {
  tutorName: string;
  rating: number = 0;
  stars: number[] = [1, 2, 3, 4, 5];
  reviewTitle: string = '';
  reviewContent: string = '';

  constructor(
    public dialogRef: MatDialogRef<ReviewDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.tutorName = data.tutorName;
  }

  setRating(star: number) {
    this.rating = star;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmitReview(): void {
    if (!this.rating || !this.reviewTitle.trim() || !this.reviewContent.trim()) {
      alert(' Please complete all fields before submitting.');
      return;
    }

    this.dialogRef.close({
      rating: this.rating,
      title: this.reviewTitle,
      content: this.reviewContent
    });
  }
}
