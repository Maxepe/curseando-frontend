import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnrollmentService } from '../../services/enrollment.service';
import { EnrollmentRequest } from '../../models/enrollment.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-enrollment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './enrollment-form.component.html',
  styleUrl: './enrollment-form.component.css'
})
export class EnrollmentFormComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() courseId!: number;
  private _isFull = false;
  @Input() set isFull(value: boolean) {
    this._isFull = !!value;
    this.updateFormDisabledState();
  }
  get isFull(): boolean { return this._isFull; }
  @Output() enrollmentSuccess = new EventEmitter<void>();

  enrollmentForm!: FormGroup;
  submitting = false;

  private toastService = inject(ToastService);

  constructor(
    private fb: FormBuilder,
    private enrollmentService: EnrollmentService
  ) {}

  ngOnInit(): void {
    this.enrollmentForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]]
    });
    this.updateFormDisabledState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isFull']) {
      this.updateFormDisabledState();
    }
  }

  ngAfterViewInit(): void {
    this.updateFormDisabledState();
  }

  onSubmit(): void {
    if (this.enrollmentForm.invalid || this.submitting || this.isFull) {
      return;
    }

    this.submitting = true;
    this.updateFormDisabledState();

    const request: EnrollmentRequest = {
      fullName: this.enrollmentForm.value.fullName.trim(),
      email: this.enrollmentForm.value.email.trim().toLowerCase()
    };

    this.enrollmentService.enroll(this.courseId, request).subscribe({
      next: (response) => {
        this.toastService.showSuccess(`¡Inscripción exitosa! ${response.studentName} se ha inscripto en ${response.courseTitle}`);
        this.submitting = false;
        this.updateFormDisabledState();

        this.enrollmentSuccess.emit();
        this.enrollmentForm.reset();
      },
      error: (err) => {
        const errorMessage = this.getErrorMessage(err.message);
        this.toastService.showError(errorMessage);
        this.submitting = false;
        this.updateFormDisabledState();
        console.error('Error enrolling:', err);
      }
    });
  }

  private updateFormDisabledState(): void {
    if (!this.enrollmentForm) {
      return;
    }
    if (this.isFull || this.submitting) {
      this.enrollmentForm.disable({ emitEvent: false });
    } else {
      this.enrollmentForm.enable({ emitEvent: false });
    }
  }

  private getErrorMessage(errorMessage: string): string {
    const lowerMessage = errorMessage.toLowerCase();

    if (lowerMessage.includes('full') || lowerMessage.includes('no seats') || lowerMessage.includes('completo')) {
      return 'El curso no tiene cupos disponibles';
    }

    if (lowerMessage.includes('already enrolled') || lowerMessage.includes('ya inscripto') || lowerMessage.includes('duplicate')) {
      return 'Ya estás inscripto en este curso';
    }

    if (lowerMessage.includes('not found') || lowerMessage.includes('no encontrado')) {
      return 'Curso no encontrado';
    }

    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
      return 'Por favor verifica los datos ingresados';
    }

    if (lowerMessage.includes('server error') || lowerMessage.includes('error del servidor')) {
      return 'Error del servidor. Intenta nuevamente';
    }

    if (lowerMessage.includes('unexpected')) {
      return 'Error inesperado. Intenta nuevamente';
    }

    return errorMessage || 'Ocurrió un error. Por favor intenta nuevamente';
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.enrollmentForm.get(fieldName);
    return !!field && field.hasError(errorType) && field.touched;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.enrollmentForm.get(fieldName);
    return !!field && field.invalid && field.touched;
  }

  getFieldError(fieldName: string): string {
    const field = this.enrollmentForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return 'Este campo es requerido';
    }

    if (field.errors['email']) {
      return 'Ingresa un email válido';
    }

    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }

    if (field.errors['maxlength']) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `No puede exceder ${maxLength} caracteres`;
    }

    return 'Campo inválido';
  }
}
