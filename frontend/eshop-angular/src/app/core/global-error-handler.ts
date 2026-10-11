import { ErrorHandler, Injectable, inject } from '@angular/core';
import { NotificationService } from './notifications/notification.service';

/** Catches uncaught runtime errors (template/rendering bugs, unhandled promise rejections) so the
 *  app never just goes silently blank. HTTP errors are already handled and shown by
 *  error.interceptor.ts - this is the net underneath everything else. */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notifications = inject(NotificationService);

  handleError(error: unknown): void {
    console.error('Unhandled error:', error);
    this.notifications.error('Something went wrong. Please try refreshing the page.');
  }
}
