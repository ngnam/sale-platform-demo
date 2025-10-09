// src/apis/types/auth.ts
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  userName: string;
  [key: string]: any;
}
