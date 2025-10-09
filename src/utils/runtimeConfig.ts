// src/utils/runtimeConfig.ts
export type RuntimeConfig = Record<string, any>;

export function getRuntimeConfig(): RuntimeConfig {
  if (typeof window === "undefined") return {};
  // support either __APP_CONFIG__ or legacy names
  return (window as any).__APP_CONFIG__ || {};
}

export function getAppTitle(): string {
  const runtime = getRuntimeConfig();
  return runtime.VITE_APP_TITLE || import.meta.env.VITE_APP_TITLE || "App MapLifeDemo";
}

export function getApiBaseUrl(): string {
  const runtime = getRuntimeConfig();
  // runtime keys from public/config.js might be VITE_API_BASE_URL or VITE_APP_BASE_API
  const candidates = [
    runtime.VITE_API_BASE_URL,
    runtime.VITE_APP_BASE_API,
    // fallback to Vite build-time env var
    (import.meta as any).env?.VITE_APP_BASE_API,
    (import.meta as any).env?.VITE_API_BASE_URL,
    // final fallback
    "/api",
  ];
  for (const v of candidates) {
    if (typeof v === "string" && v.trim() !== "") return v;
  }
  return "/api";
}
