import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { API_BASE_URL } from '../api/api-config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBaseUrl = inject(API_BASE_URL);

  // Never leak our access token to a third-party request.
  if (!req.url.startsWith(apiBaseUrl)) {
    return next(req);
  }

  const token = inject(AuthService).getAccessToken();
  if (!token) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
