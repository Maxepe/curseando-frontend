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

    const body = error.error;
      const errorResponse: Partial<ErrorResponse> =
        body && typeof body === 'object' ? (body as Partial<ErrorResponse>) : {};

      status = error.status || errorResponse.status || 500;

      switch (status) {
        case 400:
          errorMessage = this.handleBadRequest(errorResponse);
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
          errorMessage = 'Error del servidor. Intente en unos minutos.';
          break;
        default:
          errorMessage = errorResponse.message || error.message || 'Error inesperado';
      }

    console.error(`API Error [${status}]:`, errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  private handleBadRequest(error: Partial<ErrorResponse>): string {
    if (error.error === 'Validation failed' && error.message) {
      return `Error de validación: ${error.message}`;
    }
    return error.message || 'Solicitud inválida. Por favor verifica los datos ingresados.';
  }

  private handleNotFound(error: Partial<ErrorResponse>): string {
    return error.message || 'El recurso solicitado no fue encontrado.';
  }

  private handleConflict(error: Partial<ErrorResponse>): string {
    const message = (error.message || '').toLowerCase();
    if (message.includes('Course is full')) {
      return 'Este curso ya está completo.';
    }
    if (message.includes('already enrolled')) {
      return 'Ya estás inscripto en este curso.';
    }
    if (message.includes('duplicate')) {
      return 'Se detectó un registro duplicado.';
    }
    return error.message || 'Ocurrió un conflicto. Por favor inténtalo de nuevo.';
  }

  private handleValidationError(error: Partial<ErrorResponse>): string {
    if (error.message) {
      return `Error de validación: ${error.message}`;
    }
    return 'Hubo errores de validación en tu solicitud.';
  }
}
