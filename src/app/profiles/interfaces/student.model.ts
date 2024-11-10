import {Review} from "./review.model";

export interface StudentProfile {
  id: number;
  name: string;
  profilePicture: string;
  enrolledCourses: string[];
  completedCourses: string[];
  achievements: string[];
  instruments: string[];
  grades: string[];
  reviews: Review[];
}
