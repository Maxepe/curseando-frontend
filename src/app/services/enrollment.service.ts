import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { EnrollmentRequest, EnrollmentResponse } from '../models/enrollment.model';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

  /**
   * Enroll a student in a course
   * @param courseId ID of the course to enroll in
   * @param request Enrollment request with student details
   * @returns Observable of enrollment response
   */
  enroll(courseId: number, request: EnrollmentRequest): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(
      `${this.apiUrl}/${courseId}/enroll`,
      request
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors with detailed messages
   * @param error HTTP error response
   * @returns Observable error with user-friendly message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent || 
      error.message.toLowerCase().includes('network error') || 
      error.message.toLowerCase().includes('http failure')
    ) {
      errorMessage = `Error inesperado: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          } else {
            errorMessage = 'Informacion invalida. Por favor, verifique';
          }
          break;

        case 409:
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          } else {
            errorMessage = 'No se pudo inscribir. El curso puede estar lleno o ya estés inscrito';
          }
          break;

        case 404:
          errorMessage = 'Curso no encontrado';
          break;

        case 500:
          errorMessage = 'Error del servidor. Intente en unos minutos.';
          break;

        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          }
      }
    }

    console.error('EnrollmentService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
