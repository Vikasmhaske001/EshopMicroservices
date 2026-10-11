import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  /** Action button label; defaults to "Dismiss". */
  action?: string;
  /** Milliseconds before auto-dismiss; defaults per kind. */
  duration?: number;
}

const DEFAULT_DURATION: Record<ToastKind, number> = {
  success: 4000,
  info: 4000,
  warning: 5000,
  error: 6000,
};

/** The single place the app shows pop-up messages. Styling per kind lives in styles.scss
 *  (.toast-success etc.), so call sites only say what happened, not how it looks. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, options?: ToastOptions): MatSnackBarRef<TextOnlySnackBar> {
    return this.show('success', message, options);
  }

  error(message: string, options?: ToastOptions): MatSnackBarRef<TextOnlySnackBar> {
    return this.show('error', message, options);
  }

  info(message: string, options?: ToastOptions): MatSnackBarRef<TextOnlySnackBar> {
    return this.show('info', message, options);
  }

  warning(message: string, options?: ToastOptions): MatSnackBarRef<TextOnlySnackBar> {
    return this.show('warning', message, options);
  }

  private show(
    kind: ToastKind,
    message: string,
    options: ToastOptions = {}
  ): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackBar.open(message, options.action ?? 'Dismiss', {
      duration: options.duration ?? DEFAULT_DURATION[kind],
      panelClass: ['toast', `toast-${kind}`],
      // Errors interrupt screen readers; everything else waits for a pause.
      politeness: kind === 'error' ? 'assertive' : 'polite',
    });
  }
}
