import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastIdCounter = 0;
  toasts = signal<Toast[]>([]);

  showSuccess(message: string): void {
    this.addToast(message, 'success');
  }

  showError(message: string): void {
    this.addToast(message, 'error');
  }

  private addToast(message: string, type: 'success' | 'error'): void {
    const id = this.toastIdCounter++;
    const toast: Toast = { id, message, type };

    this.toasts.update(toasts => [...toasts, toast]);

    setTimeout(() => {
      this.removeToast(id);
    }, environment.toast.timeout);
  }

  removeToast(id: number): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}
