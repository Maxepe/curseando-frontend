import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CourseCardDTO, CourseDetailDTO } from '../models/course.model';
import { ErrorResponse } from '../models/error.model';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) { }

  /**
   * Get paginated list of courses with optional filtering
   * @param difficulty Optional difficulty filter (BEGINNER, INTERMEDIATE, ADVANCED)
   * @param page Page number (0-indexed)
   * @param size Number of items per page
   * @returns Observable of course cards array
   */
  getCourses(difficulty?: string, page: number = 0, size: number = 20): Observable<CourseCardDTO[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (difficulty && difficulty !== 'ALL') {
      params = params.set('difficulty', difficulty);
    }

    return this.http.get<{ content: CourseCardDTO[] }>(this.apiUrl, { params }).pipe(
      map(response => response.content),
      catchError(this.handleError)
    );
  }

  /**
   * Get detailed information for a specific course
   * @param id Course ID
   * @returns Observable of course details
   */
  getCourse(id: number): Observable<CourseDetailDTO> {
    return this.http.get<CourseDetailDTO>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   * @param error HTTP error response
   * @returns Observable error with user-friendly message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    let status = error.status || 0;

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      const body = error.error;
      const errorResponse: Partial<ErrorResponse> =
        body && typeof body === 'object' ? (body as Partial<ErrorResponse>) : {};

      status = error.status || errorResponse.status || 500;

      switch (status) {
        case 400:
          errorMessage = this.handleBadRequest(errorResponse);
          break;
        case 401:
          errorMessage = 'Authentication required. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = this.handleNotFound(errorResponse);
          break;
        case 409:
          errorMessage = this.handleConflict(errorResponse);
          break;
        case 422:
          errorMessage = this.handleValidationError(errorResponse);
          break;
        case 500:
          errorMessage = 'A server error occurred. Please try again later.';
          break;
        default:
          errorMessage = errorResponse.message || error.message || 'An unexpected error occurred';
      }
    }

    console.error(`API Error [${status}]:`, errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  private handleBadRequest(error: Partial<ErrorResponse>): string {
    if (error.error === 'Validation failed' && error.message) {
      return `Validation error: ${error.message}`;
    }
    return error.message || 'Invalid request. Please check your input.';
  }

  private handleNotFound(error: Partial<ErrorResponse>): string {
    return error.message || 'The requested resource was not found.';
  }

  private handleConflict(error: Partial<ErrorResponse>): string {
    const message = (error.message || '').toLowerCase();
    if (message.includes('Course is full')) {
      return 'This course is already at full capacity.';
    }
    if (message.includes('already enrolled')) {
      return 'You are already enrolled in this course.';
    }
    if (message.includes('duplicate')) {
      return 'A duplicate entry was detected.';
    }
    return error.message || 'A conflict occurred. Please try again.';
  }

  private handleValidationError(error: Partial<ErrorResponse>): string {
    if (error.message) {
      return `Validation error: ${error.message}`;
    }
    return 'There were validation errors in your request.';
  }
}
