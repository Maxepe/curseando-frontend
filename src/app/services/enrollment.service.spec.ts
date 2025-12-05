import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentRequest, EnrollmentResponse } from '../models/enrollment.model';
import { environment } from '../../environments/environment';
import { mockEnrollmentRequest, mockEnrollmentResponse } from './test-fixtures';

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/courses`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        EnrollmentService
      ]
    });

    service = TestBed.inject(EnrollmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  describe('enroll()', () => {
    it('should enroll successfully with 201 Created', (done) => {
      const courseId = 1;

      service.enroll(courseId, mockEnrollmentRequest).subscribe({
        next: (response: EnrollmentResponse) => {
          expect(response.enrollmentId).toBe(1);
          expect(response.message).toBe('Inscripción exitosa');
          expect(response.studentName).toBe('Test User');
          expect(response.courseTitle).toBe('Java Fundamentals');
          expect(response.enrolledAt).toBeTruthy();
          done();
        },
        error: () => fail('should not error')
      });

      const req = httpMock.expectOne(`${baseUrl}/${courseId}/enroll`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockEnrollmentRequest);
      req.flush(mockEnrollmentResponse);
    });

    it('should send request body with correct structure', (done) => {
      const courseId = 1;
      const request: EnrollmentRequest = {
        fullName: 'María González',
        email: 'maria@example.com'
      };

      service.enroll(courseId, request).subscribe({
        next: () => {
          done();
        },
        error: () => fail('should not error')
      });

      const req = httpMock.expectOne(`${baseUrl}/${courseId}/enroll`);
      expect(req.request.body.fullName).toBe('María González');
      expect(req.request.body.email).toBe('maria@example.com');
      req.flush(mockEnrollmentResponse);
    });

    it('should construct correct URL with course ID', (done) => {
      const courseId = 42;

      service.enroll(courseId, mockEnrollmentRequest).subscribe({
        next: () => {
          done();
        },
        error: () => fail('should not error')
      });

      const req = httpMock.expectOne(`${baseUrl}/42/enroll`);
      expect(req.request.method).toBe('POST');
      req.flush(mockEnrollmentResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle 400 Validation Error with message', (done) => {
      service.enroll(1, mockEnrollmentRequest).subscribe({
        next: () => fail('should error'),
        error: (error) => {
          expect(error.message).toContain('Invalid email format');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1/enroll`);
      req.flush(
        { message: 'Invalid email format' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('should handle 409 Conflict (Course Full) with backend error message', (done) => {
      const courseFullMessage = 'Course is full';

      service.enroll(1, mockEnrollmentRequest).subscribe({
        next: () => fail('should error'),
        error: (error) => {
          expect(error.message).toContain(courseFullMessage);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1/enroll`);
      req.flush(
        { message: courseFullMessage },
        { status: 409, statusText: 'Conflict' }
      );
    });

    it('should handle 409 Conflict (Duplicate Enrollment)', (done) => {
      const duplicateMessage = 'Student already enrolled in this course';

      service.enroll(1, mockEnrollmentRequest).subscribe({
        next: () => fail('should error'),
        error: (error) => {
          expect(error.message).toContain(duplicateMessage);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1/enroll`);
      req.flush(
        { message: duplicateMessage },
        { status: 409, statusText: 'Conflict' }
      );
    });

    it('should handle 404 Not Found error', (done) => {
      service.enroll(999, mockEnrollmentRequest).subscribe({
        next: () => fail('should error'),
        error: (error) => {
          expect(error.message).toContain('Course not found');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/999/enroll`);
      req.flush(
        { message: 'Course not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });

    it('should handle 500 Server Error with message', (done) => {
      service.enroll(1, mockEnrollmentRequest).subscribe({
        next: () => fail('should error'),
        error: (error) => {
          expect(error.message).toContain('Error inesperado: Error del servidor.');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1/enroll`);
      req.flush(
        { message: 'Error del servidor. Intente en unos minutos.' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('should handle network failure error', (done) => {
      service.enroll(1, mockEnrollmentRequest).subscribe({
        next: () => fail('should error'),
        error: (error) => {
          expect(error.message).toBe('Error inesperado: undefined');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1/enroll`);
      req.error(new ProgressEvent('Network error'), { status: 0, statusText: 'Unknown Error' });
    });

    it('should extract backend error message when provided', (done) => {
      const backendMessage = 'Email already registered';

      service.enroll(1, mockEnrollmentRequest).subscribe({
        next: () => fail('should error'),
        error: (error) => {
          expect(error.message).toContain(backendMessage);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1/enroll`);
      req.flush(
        { message: backendMessage },
        { status: 409, statusText: 'Conflict' }
      );
    });
  });

  describe('Request Validation', () => {
    it('should send email without transformation', (done) => {
      const request: EnrollmentRequest = {
        fullName: 'Test User',
        email: 'Test@Example.COM'  // Mixed case
      };

      service.enroll(1, request).subscribe({
        next: () => {
          done();
        },
        error: () => fail('should not error')
      });

      const req = httpMock.expectOne(`${baseUrl}/1/enroll`);
      expect(req.request.body.email).toBe('Test@Example.COM');
      req.flush(mockEnrollmentResponse);
    });

    it('should send fullName without transformation', (done) => {
      const request: EnrollmentRequest = {
        fullName: '  María González  ',
        email: 'maria@example.com'
      };

      service.enroll(1, request).subscribe({
        next: () => {
          done();
        },
        error: () => fail('should not error')
      });

      const req = httpMock.expectOne(`${baseUrl}/1/enroll`);
      expect(req.request.body.fullName).toBe('  María González  ');
      req.flush(mockEnrollmentResponse);
    });
  });
});
