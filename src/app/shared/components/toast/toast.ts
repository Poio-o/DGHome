import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <aside class="toast-container" aria-live="polite" aria-label="Notificaciones">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-card toast-{{ toast.type }}" (click)="toastService.remove(toast.id)">
          <div class="toast-indicator"></div>
          <div class="toast-content">
            <h4 class="toast-title">{{ toast.title }}</h4>
            <p class="toast-desc">{{ toast.message }}</p>
          </div>
          <button type="button" class="toast-close" (click)="toastService.remove(toast.id)">&times;</button>
        </div>
      }
    </aside>
  `,
  styleUrl: './toast.css',
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}