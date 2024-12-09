import {Review} from "./review.model";

export interface TutorProfile {
  id: number;
  name: string;
  bio: string;
  profileType: string;
  appUserId: number;
  profilePicture: string;
  qualifications: string;
  instruments: string[];
  onlineLessons: boolean;
  pricing: number;
  enrolledStudents: number;
  rating: number;
  reviews: Review[];
  pricesMap: Map<string, number>;
  genres: string[];
}
