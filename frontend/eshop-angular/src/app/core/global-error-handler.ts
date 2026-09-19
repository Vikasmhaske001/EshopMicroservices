import { ErrorHandler, Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Catches uncaught runtime errors (template/rendering bugs, unhandled promise rejections) so the
 *  app never just goes silently blank. HTTP errors are already handled and shown by
 *  error.interceptor.ts - this is the net underneath everything else. */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly snackBar = inject(MatSnackBar);

  handleError(error: unknown): void {
    console.error('Unhandled error:', error);
    this.snackBar.open('Something went wrong. Please try refreshing the page.', 'Dismiss', {
      duration: 6000,
    });
  }
}
