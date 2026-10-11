import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../notifications/notification.service';

// Pair with authGuard on admin routes (canActivate: [authGuard, adminGuard]) - this guard only
// decides "is this authenticated user an Admin", not "is there a session at all".
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notifications = inject(NotificationService);

  if (authService.roles().includes('Admin')) {
    return true;
  }

  notifications.warning('Access denied: administrator privileges required.');
  return router.createUrlTree(['/products']);
};
