/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENABLE_POSTPROCESSING: string;
  readonly VITE_ENABLE_DEVICE_DETECTION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
