export interface EnrollmentRequest {
  fullName: string;
  email: string;
}

export interface EnrollmentResponse {
  enrollmentId: number;
  message: string;
  enrolledAt: string;
  studentName: string;
  courseTitle: string;
}
