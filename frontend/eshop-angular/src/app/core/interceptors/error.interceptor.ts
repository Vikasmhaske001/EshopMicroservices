import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AppError } from '../../shared/models/app-error.model';
import { ProblemDetails } from '../../shared/models/problem-details.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: unknown) => {
      const appError = toAppError(error);
      snackBar.open(appError.detail ?? appError.title, 'Dismiss', { duration: 5000 });
      return throwError(() => appError);
    })
  );
};

function toAppError(error: unknown): AppError {
  if (error instanceof HttpErrorResponse) {
    // status 0 means the request never reached a server (network down, CORS, gateway unreachable) -
    // error.error is a raw ProgressEvent then, not parsed ProblemDetails JSON.
    const problem = (error.status !== 0 ? error.error : null) as Partial<ProblemDetails> | null;
    return {
      status: error.status,
      title: problem?.title ?? defaultTitleFor(error.status),
      detail: problem?.detail,
      errors: problem?.errors,
    };
  }
  return { status: -1, title: 'Unexpected error' };
}

function defaultTitleFor(status: number): string {
  switch (status) {
    case 0:
      return 'Cannot reach the server';
    case 401:
      return 'You need to sign in';
    case 403:
      return 'You do not have permission to do that';
    case 404:
      return 'Not found';
    case 400:
    case 422:
      return 'Invalid request';
    default:
      return 'Something went wrong';
  }
}
