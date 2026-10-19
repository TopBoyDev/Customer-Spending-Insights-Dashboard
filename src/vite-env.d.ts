/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CUSTOMER_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
