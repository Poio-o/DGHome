import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { IconComponent } from '../shared/components/icon/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);

  public readonly loginForm = this.fb.group({
    identifier: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  public get identifier() {
    return this.loginForm.get('identifier');
  }

  public get password() {
    return this.loginForm.get('password');
  }

  public onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { identifier, password } = this.loginForm.getRawValue();

    this.authService
      .login({
        identifier: identifier!,
        password: password!,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.isLoading.set(false);
          const message =
            err.error?.message ||
            'Error al iniciar sesión. Verifique sus credenciales.';
          this.errorMessage.set(message);
        },
      });
  }

  public goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
