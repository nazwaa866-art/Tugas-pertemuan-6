import type { AppEnvironmentConfig } from '../types/task';

// Only non-secret VITE_* variables are read on the client side.
export function loadAppConfig(): AppEnvironmentConfig {
  const env = import.meta.env;

  const appName: string = env.VITE_APP_NAME || 'Catatan Tugas Kuliah';
  const appVersion: string = env.VITE_APP_VERSION || '1.0.0';
  const authorName: string = env.VITE_AUTHOR_NAME || 'Nazwa Kholifah';
  const authorNim: string = env.VITE_AUTHOR_NIM || '1247050138';
  const authorClass: string = env.VITE_AUTHOR_CLASS || 'C';
  const courseName: string = env.VITE_COURSE_NAME || 'Pengembangan Aplikasi Web';
  const semester: string = env.VITE_SEMESTER || 'Semester 5';
  const isProduction: boolean = Boolean(env.PROD);

  return {
    appName,
    appVersion,
    authorName,
    authorNim,
    authorClass,
    courseName,
    semester,
    isProduction,
  };
}
