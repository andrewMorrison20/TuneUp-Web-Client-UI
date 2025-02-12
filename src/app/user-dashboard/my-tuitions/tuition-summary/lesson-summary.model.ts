export interface LessonSummary {
  id: number;
  tuitionId: number;
  availability: {
    id: number;
    profileId: number;
    startTime: string;
    endTime: string;
    status: string;
  };
  lessonStatus: string;
  lessonType: string | null;
}
