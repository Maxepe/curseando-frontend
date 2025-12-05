import { CourseCardDTO, CourseDetailDTO, Difficulty } from '../models/course.model';
import { PageResponse } from '../services/courses.service';
import { EnrollmentRequest, EnrollmentResponse } from '../models/enrollment.model';

export const mockCourses: CourseCardDTO[] = [
  {
    id: 1,
    title: 'Java Fundamentals',
    instructor: 'María López',
    duration: '8 weeks',
    difficulty: Difficulty.BEGINNER,
    capacity: 30,
    enrolledCount: 15,
    seatsLeft: 15
  },
  {
    id: 2,
    title: 'Spring Boot Pro',
    instructor: 'Diego Gómez',
    duration: '6 weeks',
    difficulty: Difficulty.INTERMEDIATE,
    capacity: 20,
    enrolledCount: 19,
    seatsLeft: 1
  },
  {
    id: 3,
    title: 'Advanced DB Design',
    instructor: 'Lucía Pérez',
    duration: '10 weeks',
    difficulty: Difficulty.ADVANCED,
    capacity: 10,
    enrolledCount: 10,
    seatsLeft: 0
  }
];

export const mockCourseDetail: CourseDetailDTO = {
  ...mockCourses[0],
  description: 'Learn Java from scratch with hands-on projects.',
  createdAt: '2025-12-01T10:00:00Z',
  updatedAt: '2025-12-05T15:00:00Z'
};

export const mockPageResponse: PageResponse<CourseCardDTO> = {
  content: mockCourses,
  totalElements: 30,
  totalPages: 3,
  number: 0,
  last: false
};

export const mockEnrollmentRequest: EnrollmentRequest = {
  fullName: 'Test User',
  email: 'test@example.com'
};

export const mockEnrollmentResponse: EnrollmentResponse = {
  enrollmentId: 1,
  message: 'Inscripción exitosa',
  enrolledAt: '2025-12-05T15:30:00Z',
  studentName: 'Test User',
  courseTitle: 'Java Fundamentals'
};
