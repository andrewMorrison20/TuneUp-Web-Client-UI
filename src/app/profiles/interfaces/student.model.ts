import {Review} from "./review.model";
import {Genre, Instrument} from "../../components/search-bar/search-bar.component";
import {TuitionRegion} from "./tuition-region.model";
import {Image} from "./image.model";
import {Qualification} from "../../components/shared-data-service.component";

export interface StudentProfile {
  id: number;
  displayName: string;
  bio: string;
  averageRating:number;
  profileType: string;
  lessonType: string;
  profilePicture: Image;
  enrolledCourses: string[];
  completedCourses: string[];
  qualifications: Qualification[];
  instruments: Instrument[];
  grades: string[];
  reviews: Review[];
  appUserId: number;
  genres: Genre[];
  tuitionRegion: TuitionRegion;
}
