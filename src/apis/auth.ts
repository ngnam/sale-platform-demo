// src/apis/auth.ts
import { post } from '@/utils/http';
import type { LoginRequest, LoginResponse } from './types/auth';

const URL = {
  login: "/auth/login",
  logout: "/auth/logout",
};

export const AuthApi = {
  login(payload: LoginRequest): Promise<LoginResponse> {
    return post<LoginResponse>(URL.login, payload);
  },
  logout(): Promise<void> {
    return post(URL.logout);
  },
};
