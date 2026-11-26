export type TaskStatus = 'Belum Selesai' | 'Selesai';

export type TaskPriority = 'Rendah' | 'Sedang' | 'Tinggi';

export type StatusFilter = 'Semua' | TaskStatus;

export type ActiveTab = 'tugas' | 'dokumentasi';

export interface CourseTask {
  id: string;
  title: string;
  course: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  completed: boolean;
  estimatedHours: number;
  notes: string;
  createdAt: string;
}

export interface TaskInput {
  title: string;
  course: string;
  deadline: string;
  priority: TaskPriority;
  estimatedHours: number;
  notes: string;
}

export interface TaskSummary {
  total: number;
  pending: number;
  done: number;
  completionRate: number;
}

export interface AppEnvironmentConfig {
  appName: string;
  appVersion: string;
  authorName: string;
  authorNim: string;
  authorClass: string;
  courseName: string;
  semester: string;
  isProduction: boolean;
}

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
