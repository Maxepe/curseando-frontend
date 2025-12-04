export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export interface CourseCardDTO {
  id: number;
  title: string;
  instructor: string;
  duration: string;
  difficulty: Difficulty;
  capacity: number;
  enrolledCount: number;
  seatsLeft: number;
}

export interface CourseDetailDTO extends CourseCardDTO {
  description: string;
  createdAt: string;
  updatedAt: string;
}
