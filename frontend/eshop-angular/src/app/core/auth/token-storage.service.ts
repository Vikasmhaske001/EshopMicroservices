import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'eshop.accessToken';
const ACCESS_TOKEN_EXPIRES_AT_KEY = 'eshop.accessTokenExpiresAt';
const REFRESH_TOKEN_KEY = 'eshop.refreshToken';

export interface StoredTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
}

/** Stores tokens in localStorage - a deliberate, documented tradeoff (see docs/ANGULAR_IMPLEMENTATION_PLAN.md
 *  section 6). Vulnerable to XSS reading the token; acceptable for now, with httpOnly cookies flagged
 *  as a future hardening step. */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  save(tokens: StoredTokens): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, tokens.accessTokenExpiresAt);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
