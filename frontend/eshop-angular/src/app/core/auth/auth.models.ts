export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  userName: string;
  roles: string[];
  refreshToken: string;
}

export interface AuthUser {
  userName: string;
  roles: string[];
}
