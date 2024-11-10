import {Review} from "./review.model";

export interface TutorProfile {
  id: number;
  name: string;
  profilePicture: string;
  qualifications: string;
  instruments: string[];
  onlineLessons: boolean;
  pricing: number;
  enrolledStudents: number;
  rating: number;
  reviews: Review[];
}
