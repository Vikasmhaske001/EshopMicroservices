import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { AppError } from '../../../shared/models/app-error.model';
import { ErrorBanner } from '../../../shared/components/error-banner/error-banner';
import { AuthShell } from '../../../shared/components/auth-shell/auth-shell';
import { EsInput } from '../../../shared/components/form-field/es-input';
import { FormField } from '../../../shared/components/form-field/form-field';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthShell,
    EsInput,
    ErrorBanner,
    FormField,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notifications = inject(NotificationService);

  protected readonly returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

  protected readonly form = this.fb.nonNullable.group({
    userName: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.notifications.success(`Welcome back, ${this.authService.currentUser()?.userName}!`);
        this.router.navigateByUrl(this.returnUrl || '/products');
      },
      error: (error: AppError) => {
        this.submitting.set(false);
        this.errorMessage.set(
          error.status === 401 ? 'Incorrect username or password.' : (error.detail ?? error.title)
        );
      },
    });
  }
}
