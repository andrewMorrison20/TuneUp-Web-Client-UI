import {Review} from "./review.model";

export interface StudentProfile {
  id: number;
  name: string;
  bio: string;
  profileType: string;
  onlineLessons: boolean;
  profilePicture: string;
  enrolledCourses: string[];
  completedCourses: string[];
  achievements: string[];
  instruments: string[];
  grades: string[];
  reviews: Review[];
  appUserId: number;
  genres: string[];
  tuitionRegion: string;
}
