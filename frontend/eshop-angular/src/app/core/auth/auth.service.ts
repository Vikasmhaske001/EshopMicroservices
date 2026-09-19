import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_BASE_URL } from '../api/api-config';
import { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from './auth.models';
import { decodeJwtUser } from './jwt.util';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);
  private readonly authUrl = `${inject(API_BASE_URL)}/auth-service/auth`;

  private readonly currentUserSignal = signal<AuthUser | null>(this.restoreUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly roles = computed(() => this.currentUserSignal()?.roles ?? []);

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.authUrl}/login`, request)
      .pipe(tap((response) => this.applyAuthResponse(response)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.authUrl}/register`, request)
      .pipe(tap((response) => this.applyAuthResponse(response)));
  }

  /** Used by refresh.interceptor.ts to silently renew an expired access token. */
  refresh(): Observable<AuthResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available.'));
    }

    return this.http
      .post<AuthResponse>(`${this.authUrl}/refresh`, { refreshToken })
      .pipe(tap((response) => this.applyAuthResponse(response)));
  }

  logout(): void {
    const refreshToken = this.tokenStorage.getRefreshToken();
    this.clearSession();

    if (refreshToken) {
      // Best-effort server-side revocation - the user is logged out locally either way, and the
      // logout endpoint is idempotent/silent about tokens it doesn't recognize.
      this.http.post(`${this.authUrl}/logout`, { refreshToken }).subscribe({ error: () => {} });
    }

    this.router.navigateByUrl('/login');
  }

  getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }

  private applyAuthResponse(response: AuthResponse): void {
    this.tokenStorage.save({
      accessToken: response.token,
      accessTokenExpiresAt: response.expiresAt,
      refreshToken: response.refreshToken,
    });
    // Decoding the token we just received (rather than trusting response.userName/roles
    // separately) keeps one source of truth and is how id/email become available too.
    this.currentUserSignal.set(decodeJwtUser(response.token));
  }

  private clearSession(): void {
    this.tokenStorage.clear();
    this.currentUserSignal.set(null);
  }

  private restoreUser(): AuthUser | null {
    const accessToken = this.tokenStorage.getAccessToken();
    return accessToken ? decodeJwtUser(accessToken) : null;
  }
}
