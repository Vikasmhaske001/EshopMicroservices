import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/** Coordinates concurrent 401s so only ONE /auth/refresh call is ever in flight at a time.
 *  This matters specifically because refresh tokens are single-use/rotating: if two requests
 *  both 401 at once and each called /auth/refresh independently, the second call would arrive
 *  with a refresh token the first call had already revoked, and fail. */
@Injectable({ providedIn: 'root' })
class RefreshCoordinator {
  isRefreshing = false;
  readonly refreshedToken$ = new BehaviorSubject<string | null>(null);
}

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const coordinator = inject(RefreshCoordinator);

  // A 401 from one of these IS the auth failure, not something a refresh can fix - retrying
  // would either loop (refresh calling itself) or make no sense (bad login credentials).
  if (isAuthLifecycleRequest(req.url)) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      return handleUnauthorized(req, next, authService, coordinator);
    })
  );
};

function handleUnauthorized(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  coordinator: RefreshCoordinator
): Observable<HttpEvent<unknown>> {
  if (!coordinator.isRefreshing) {
    coordinator.isRefreshing = true;
    coordinator.refreshedToken$.next(null);

    return authService.refresh().pipe(
      switchMap((response) => {
        coordinator.isRefreshing = false;
        coordinator.refreshedToken$.next(response.token);

        return next(withToken(req, response.token)).pipe(
          catchError((retryError) => {
            // The refresh "succeeded" but the retried request is still unauthorized - the
            // session is unrecoverable, so log out rather than leaving the app in a stuck state.
            authService.logout();
            return throwError(() => retryError);
          })
        );
      }),
      catchError((refreshError) => {
        coordinator.isRefreshing = false;
        authService.logout();
        return throwError(() => refreshError);
      })
    );
  }

  // A refresh triggered by another request is already in flight - wait for it and reuse its result.
  return coordinator.refreshedToken$.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(withToken(req, token)))
  );
}

function withToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function isAuthLifecycleRequest(url: string): boolean {
  return url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register');
}
