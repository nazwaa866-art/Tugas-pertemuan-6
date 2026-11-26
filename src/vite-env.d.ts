/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_AUTHOR_NAME?: string;
  readonly VITE_AUTHOR_NIM?: string;
  readonly VITE_AUTHOR_CLASS?: string;
  readonly VITE_COURSE_NAME?: string;
  readonly VITE_SEMESTER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
