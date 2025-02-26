export interface LessonSummary {
  id: number;
  tuitionId: number;
  displayName: string | null
  availabilityDto: {
    id: number;
    profileId: number;
    startTime: string;
    endTime: string;
    status: string;
  };
  lessonStatus: string;
  lessonType: string | null;
}
