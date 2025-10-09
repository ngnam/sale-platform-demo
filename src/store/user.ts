// src/store/user.ts
import { defineStore } from 'pinia';
import { AuthApi } from '@/apis/auth';
import type { LoginRequest } from '@/apis/types/auth';
import { setAuthToken } from '@/utils/http';

export interface UserState {
  token: string;
  expiresAt: string | null;
  userName: string | undefined | null;
  profile: Record<string, any> | null;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    token: "",
    expiresAt: null,
    userName: null,
    profile: null,
  }),
  getters: {
    isLoggedIn: (state): boolean => {
      return !!state.token && !isTokenExpired(state.expiresAt);
    },
    tokenExpiresAt: (state): string | null => state.expiresAt,
  },
  actions: {
    async login(payload: LoginRequest) {
      const res = await AuthApi.login(payload);
      this.setAuthFromResponse(res);
      // lưu local để giữ phiên sau reload
      localStorage.setItem("auth_token", this.token);
      if (this.expiresAt)
        localStorage.setItem("auth_expiresAt", this.expiresAt);
      if (this.userName) localStorage.setItem("auth_userName", this.userName);
      // update axios defaults
      setAuthToken(this.token);
      return res;
    },

    logout() {
      this.clearAuth();
      // clear axios header
      setAuthToken(null);
      // gọi API logout nếu cần
      // try { AuthApi.logout(); } catch { /* ignore */ }
    },

    loadFromStorage() {
      const token = localStorage.getItem("auth_token");
      const expiresAt = localStorage.getItem("auth_expiresAt");
      const userName = localStorage.getItem("auth_userName");
      if (token) {
        this.token = token;
        this.expiresAt = expiresAt;
        this.userName = userName;
      }
    },

    setAuthFromResponse(res: {
      token: string;
      expiresAt?: string;
      userName?: string;
      [k: string]: any;
    }) {
      this.token = res.token;
      this.expiresAt = res.expiresAt ?? null;
      this.userName = res.userName ?? null;
      // nếu API trả thêm thông tin user profile, map vào profile
      if (res.user) this.profile = res.user;
      else {
        // giữ nguyên profile nếu không có payload user
        this.profile = this.profile ?? null;
      }
    },

    clearAuth() {
      this.token = "";
      this.expiresAt = null;
      this.userName = null;
      this.profile = null;
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_expiresAt");
      localStorage.removeItem("auth_userName");
    },
  },
});

// helper ngoài store
function isTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  if (Number.isNaN(t)) return false;
  return Date.now() > t;
}
