import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../api/api-config';

const API_BASE = 'http://test-api';
const AUTH_URL = `${API_BASE}/auth-service/auth`;

function createTestToken(payload: object): string {
  const base64url = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  // Signature is never verified client-side (that's the backend's job) - any value works here.
  return `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url(payload)}.signature`;
}

const TEST_PAYLOAD = {
  sub: 'user-123',
  name: 'testuser',
  email: 'testuser@eshop.local',
  role: 'Customer',
  exp: Math.floor(Date.now() / 1000) + 3600,
  iss: 'eshop-identity',
  aud: 'eshop-clients',
};

describe('AuthService', () => {
  let httpMock: HttpTestingController;

  function setup(): AuthService {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // logout() navigates to /login - without a matching route, navigateByUrl's rejected
        // promise surfaces as an unhandled rejection instead of a clean assertion failure.
        provideRouter([{ path: 'login', children: [] }]),
        { provide: API_BASE_URL, useValue: API_BASE },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    return TestBed.inject(AuthService);
  }

  beforeEach(() => localStorage.clear());

  afterEach(() => {
    httpMock?.verify();
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('starts unauthenticated when there is no stored token', () => {
    const service = setup();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.roles()).toEqual([]);
  });

  it('restores the signed-in user from a token already in storage, without a network call', () => {
    localStorage.setItem('eshop.accessToken', createTestToken(TEST_PAYLOAD));

    const service = setup();

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual({
      id: 'user-123',
      userName: 'testuser',
      email: 'testuser@eshop.local',
      roles: ['Customer'],
    });
  });

  it('login() persists both tokens and decodes the user from the returned JWT (not the response body fields)', () => {
    const service = setup();
    const token = createTestToken(TEST_PAYLOAD);

    service.login({ userName: 'testuser', password: 'pw' }).subscribe();

    const req = httpMock.expectOne(`${AUTH_URL}/login`);
    expect(req.request.method).toBe('POST');
    req.flush({
      token,
      expiresAt: '2099-01-01T00:00:00Z',
      userName: 'testuser',
      roles: ['Customer'],
      refreshToken: 'refresh-token-value',
    });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.id).toBe('user-123');
    expect(service.currentUser()?.email).toBe('testuser@eshop.local');
    expect(localStorage.getItem('eshop.accessToken')).toBe(token);
    expect(localStorage.getItem('eshop.refreshToken')).toBe('refresh-token-value');
  });

  it('logout() clears local storage, best-effort revokes the refresh token, and navigates to /login', () => {
    localStorage.setItem('eshop.accessToken', createTestToken(TEST_PAYLOAD));
    localStorage.setItem('eshop.refreshToken', 'refresh-token-value');
    const service = setup();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    service.logout();

    // Session is cleared immediately, without waiting on the network call.
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('eshop.accessToken')).toBeNull();
    expect(localStorage.getItem('eshop.refreshToken')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith('/login');

    const req = httpMock.expectOne(`${AUTH_URL}/logout`);
    expect(req.request.body).toEqual({ refreshToken: 'refresh-token-value' });
    req.flush({});
  });

  it('logout() does not call the API when there is no refresh token to revoke', () => {
    const service = setup();

    service.logout();

    httpMock.expectNone(`${AUTH_URL}/logout`);
  });

  it('refresh() fails fast (no HTTP call) when there is no refresh token stored', () => {
    const service = setup();
    let caught: Error | undefined;

    service.refresh().subscribe({ error: (err) => (caught = err) });

    expect(caught?.message).toBe('No refresh token available.');
    httpMock.expectNone(`${AUTH_URL}/refresh`);
  });
});
