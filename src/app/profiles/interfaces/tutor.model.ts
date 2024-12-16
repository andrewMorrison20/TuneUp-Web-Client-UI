import {Review} from "./review.model";
import {Genre, Instrument} from "../../components/search-bar/search-bar.component";
import {TuitionRegion} from "./tuition-region.model";

export interface TutorProfile {
  id: number;
  name: string;
  bio: string;
  profileType: string;
  appUserId: number;
  profilePicture: string;
  qualifications: string;
  instruments: Instrument[];
  onlineLessons: boolean;
  enrolledStudents: number;
  rating: number;
  reviews: Review[];
  pricesMap: Map<string, number>;
  genres: Genre[];
  tuitionRegion: TuitionRegion;
}
