import {Review} from "./review.model";
import {Genre, Instrument} from "../../components/search-bar/search-bar.component";
import {TuitionRegion} from "./tuition-region.model";

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
  instruments: Instrument[];
  grades: string[];
  reviews: Review[];
  appUserId: number;
  genres: Genre[];
  tuitionRegion: TuitionRegion;
}
