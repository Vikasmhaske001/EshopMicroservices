import { AuthUser } from './auth.models';

interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  role: string | string[];
  exp: number;
  iss: string;
  aud: string;
}

/** Decodes the payload of a JWT without verifying its signature - verification is the backend's job.
 *  This is only used to read back the user info we already trust because we just received the token
 *  from our own Identity service (login/register/refresh), or restored it from local storage. */
export function decodeJwtUser(token: string): AuthUser | null {
  try {
    const payloadSegment = token.split('.')[1];
    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded)) as JwtPayload;

    return {
      id: payload.sub,
      userName: payload.name,
      email: payload.email,
      roles: Array.isArray(payload.role) ? payload.role : [payload.role],
    };
  } catch {
    return null;
  }
}
