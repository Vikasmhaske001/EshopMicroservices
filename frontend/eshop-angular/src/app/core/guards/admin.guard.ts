import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

// Pair with authGuard on admin routes (canActivate: [authGuard, adminGuard]) - this guard only
// decides "is this authenticated user an Admin", not "is there a session at all".
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (authService.roles().includes('Admin')) {
    return true;
  }

  snackBar.open('Access denied: administrator privileges required.', 'Dismiss', { duration: 5000 });
  return router.createUrlTree(['/products']);
};
