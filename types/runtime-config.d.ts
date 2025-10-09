// src/types/runtime-config.d.ts
interface AppConfig {
  VITE_API_BASE_URL?: string;
  VITE_APP_BASE_API?: string;
  [key: string]: any;
}

interface Window {
  __APP_CONFIG__?: AppConfig;
}
