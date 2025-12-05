import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CoursesService, PageResponse } from './courses.service';
import { CourseCardDTO, CourseDetailDTO, Difficulty } from '../models/course.model';
import { environment } from '../../environments/environment';
import { mockCourses, mockCourseDetail, mockPageResponse } from './test-fixtures';

describe('CoursesService', () => {
  let service: CoursesService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/courses`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CoursesService
      ]
    });

    service = TestBed.inject(CoursesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getCourses()', () => {
    it('should fetch all courses successfully with pagination', (done) => {
      service.getCourses(undefined, 0, 10).subscribe({
        next: (response: PageResponse<CourseCardDTO>) => {
          expect(response.content.length).toBe(3);
          expect(response.totalElements).toBe(30);
          expect(response.totalPages).toBe(3);
          expect(response.number).toBe(0);
          expect(response.last).toBe(false);
          expect(response.content[0].title).toBe('Java Fundamentals');
          done();
        },
        error: () => fail('should not error')
      });

      const req = httpMock.expectOne(`${baseUrl}?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPageResponse);
    });

    it('should filter courses by BEGINNER difficulty', (done) => {
      const beginnerCourses: CourseCardDTO[] = [mockCourses[0]];
      const response: PageResponse<CourseCardDTO> = {
        ...mockPageResponse,
        content: beginnerCourses,
        totalElements: 1
      };

      service.getCourses('BEGINNER', 0, 10).subscribe({
        next: (result) => {
          expect(result.content.length).toBe(1);
          expect(result.content[0].difficulty).toBe(Difficulty.BEGINNER);
          done();
        },
        error: () => fail('should not error')
      });

      const req = httpMock.expectOne(`${baseUrl}?page=0&size=10&difficulty=BEGINNER`);
      expect(req.request.method).toBe('GET');
      req.flush(response);
    });

    it('should filter courses by INTERMEDIATE difficulty', (done) => {
      const intermediateCourses: CourseCardDTO[] = [mockCourses[1]];
      const response: PageResponse<CourseCardDTO> = {
        ...mockPageResponse,
        content: intermediateCourses
      };

      service.getCourses('INTERMEDIATE', 0, 10).subscribe({
        next: (result) => {
          expect(result.content[0].difficulty).toBe(Difficulty.INTERMEDIATE);
          done();
        },
        error: () => fail('should not error')
      });

      const req = httpMock.expectOne(`${baseUrl}?page=0&size=10&difficulty=INTERMEDIATE`);
      expect(req.request.method).toBe('GET');
      req.flush(response);
    });

    it('should filter courses by ADVANCED difficulty', (done) => {
      const advancedCourses: CourseCardDTO[] = [mockCourses[2]];
      const response: PageResponse<CourseCardDTO> = {
        ...mockPageResponse,
        content: advancedCourses
      };

      service.getCourses('ADVANCED', 0, 10).subscribe({
        next: (result) => {
          expect(result.content[0].difficulty).toBe(Difficulty.ADVANCED);
          done();
        },
        error: () => fail('should not error')
      });

      const req = httpMock.expectOne(`${baseUrl}?page=0&size=10&difficulty=ADVANCED`);
      expect(req.request.method).toBe('GET');
      req.flush(response);
    });

    it('should not add difficulty parameter when difficulty is ALL', (done) => {
      service.getCourses('ALL', 0, 10).subscribe({
        next: () => {
          done();
        },
        error: () => fail('should not error')
      });

      const req = httpMock.expectOne(`${baseUrl}?page=0&size=10`);
      expect(req.request.params.has('difficulty')).toBe(false);
      req.flush(mockPageResponse);
    });

    it('should handle custom pagination parameters', (done) => {
      service.getCourses(undefined, 2, 20).subscribe({
        next: () => {
          done();
        },
        error: () => fail('should not error')
      });

      const req = httpMock.expectOne(`${baseUrl}?page=2&size=20`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPageResponse);
    });
  });

  describe('getCourse(id)', () => {
    it('should fetch a single course by ID successfully', (done) => {
      service.getCourse(1).subscribe({
        next: (course: CourseDetailDTO) => {
          expect(course.id).toBe(1);
          expect(course.title).toBe('Java Fundamentals');
          expect(course.description).toBe('Learn Java from scratch with hands-on projects.');
          expect(course.seatsLeft).toBe(15);
          done();
        },
        error: () => fail('should not error')
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCourseDetail);
    });

    it('should handle 404 Not Found error with message', (done) => {
      service.getCourse(999).subscribe({
        next: () => fail('should error'),
        error: (error) => {
          expect(error.message).toBe('Course not found');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush(
        { message: 'Course not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });

    it('should handle 500 Server Error with message', (done) => {
      service.getCourse(1).subscribe({
        next: () => fail('should error'),
        error: (error) => {
          expect(error.message).toBe('Error del servidor. Intente en unos minutos.');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.flush(
        { message: 'Internal Server Error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('should handle network failure with message', (done) => {
      service.getCourse(1).subscribe({
        next: () => fail('should error'),
        error: (error) => {
          expect(error.message).toContain('Error del servidor. Intente en unos minutos.');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.error(new ProgressEvent('Network error'), { status: 0, statusText: 'Unknown Error' });
    });
  });

  describe('Error Handling', () => {
    it('should handle 400 Bad Request error', (done) => {
      service.getCourses(undefined, 0, 10).subscribe({
        next: () => fail('should error'),
        error: (error) => {
          expect(error.message).toBe('Bad Request');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}?page=0&size=10`);
      req.flush(
        { message: 'Bad Request' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('should handle 409 Conflict error', (done) => {
      service.getCourses(undefined, 0, 10).subscribe({
        next: () => fail('should error'),
        error: (error) => {
          expect(error.message).toBe('Conflict');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}?page=0&size=10`);
      req.flush(
        { message: 'Conflict' },
        { status: 409, statusText: 'Conflict' }
      );
    });

    it('should handle 422 Validation Error', (done) => {
      service.getCourses(undefined, 0, 10).subscribe({
        next: () => fail('should error'),
        error: (error) => {
          expect(error.message).toBe('Error de validación: Validation Error');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}?page=0&size=10`);
      req.flush(
        { message: 'Validation Error' },
        { status: 422, statusText: 'Unprocessable Entity' }
      );
    });

    it('should use default error message for unknown status codes', (done) => {
      service.getCourses(undefined, 0, 10).subscribe({
        next: () => fail('should error'),
        error: (error) => {
          // For unknown status codes with no message, returns the HttpErrorResponse message
          expect(error.message).toContain('Http failure response');
          expect(error.message).toContain('503 Service Unavailable');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}?page=0&size=10`);
      req.flush(
        {},
        { status: 503, statusText: 'Service Unavailable' }
      );
    });

    it('should extract error message from backend response', (done) => {
      const backendMessage = 'Database connection failed';

      service.getCourses(undefined, 0, 10).subscribe({
        next: () => fail('should error'),
        error: (error) => {
          expect(error.message).toBe('Error del servidor. Intente en unos minutos.');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}?page=0&size=10`);
      req.flush(
        { message: backendMessage },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });
});
