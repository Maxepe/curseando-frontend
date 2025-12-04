import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CourseCardDTO, CourseDetailDTO } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

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

    if (difficulty/* && difficulty !== 'ALL'*/) {
      params = params.set('difficulty', difficulty);
    }

    return this.http.get<{ content: CourseCardDTO[] }>(this.apiUrl, { params }).pipe(
      map(response => response.content), // Extract the content array
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
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Backend error
      if (error.status === 404) {
        errorMessage = 'Course not found';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      }
    }

    console.error('CoursesService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
