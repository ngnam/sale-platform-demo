// src/types/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string;
  readonly VITE_APP_BASE_API?: string;
  // add other env vars here
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
