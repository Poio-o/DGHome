import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { IconComponent } from '../shared/components/icon/icon';

export function passwordsMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const passwordAgain = control.get('passwordAgain')?.value;
  if (!password || !passwordAgain) return null;
  return password === passwordAgain ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);

  public readonly registerForm = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordAgain: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator }
  );

  public get username() {
    return this.registerForm.get('username');
  }

  public get email() {
    return this.registerForm.get('email');
  }

  public get password() {
    return this.registerForm.get('password');
  }

  public get passwordAgain() {
    return this.registerForm.get('passwordAgain');
  }

  public onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { username, email, password } = this.registerForm.getRawValue();

    this.authService
      .register({
        username: username!,
        email: email!,
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
            'Error al registrar la cuenta. Inténtelo de nuevo.';
          this.errorMessage.set(message);
        },
      });
  }

  public goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
