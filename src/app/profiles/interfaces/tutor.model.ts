import {Review} from "./review.model";
import {Genre, Instrument} from "../../components/search-bar/search-bar.component";
import {TuitionRegion} from "./tuition-region.model";
import {Image} from "./image.model";
import {Price} from "./price";

export interface TutorProfile {
  id: number;
  displayName: string;
  bio: string;
  profileType: string;
  appUserId: number;
  profilePicture: Image;
  qualifications: string;
  instruments: Instrument[];
  onlineLessons: boolean;
  enrolledStudents: number;
  reviews: Review[];
  prices: Price[];
  genres: Genre[];
  averageRating: number;
  tuitionRegion: TuitionRegion;
}
