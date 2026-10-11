import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { AppError } from '../../../shared/models/app-error.model';
import { ErrorBanner } from '../../../shared/components/error-banner/error-banner';
import { FieldError } from '../../../shared/components/field-error/field-error';
import { AppValidators } from '../../../shared/validators/app-validators';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ErrorBanner,
    FieldError,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notifications = inject(NotificationService);

  protected readonly returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

  // Mirrors Identity.Api: RegisterRequestValidator (username >= 3, valid email, password >= 6)
  // plus ASP.NET Identity's allowed username characters and its lowercase + digit password rules.
  protected readonly form = this.fb.nonNullable.group({
    userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), AppValidators.username]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: [
      '',
      [Validators.required, Validators.minLength(6), Validators.maxLength(100), AppValidators.passwordPolicy],
    ],
  });

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.notifications.success(
          `Welcome to EShop, ${this.authService.currentUser()?.userName}! Your account is ready.`
        );
        this.router.navigateByUrl(this.returnUrl || '/products');
      },
      error: (error: AppError) => {
        this.submitting.set(false);
        this.errorMessage.set(
          error.errors ? Object.values(error.errors).flat().join(' ') : (error.detail ?? error.title)
        );
      },
    });
  }
}
