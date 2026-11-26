import { nanoid } from 'nanoid';
import type {
  ActionResult,
  CourseTask,
  StatusFilter,
  TaskInput,
  TaskPriority,
  TaskStatus,
  TaskSummary,
} from '../types/task';
import { filterItems, sortItems } from '../utils/collection';

export const COURSE_SUGGESTIONS: string[] = [
  'Pengembangan Aplikasi Web',
  'Rekayasa Perangkat Lunak',
  'Basis Data Lanjut',
  'Jaringan Komputer',
  'Interaksi Manusia dan Komputer',
];

export const INITIAL_TASKS: CourseTask[] = [
  {
    id: 'task-paw-06',
    title: 'Tugas Pertemuan 6: Aplikasi Daftar Tugas dengan TypeScript dan Vite',
    course: 'Pengembangan Aplikasi Web',
    deadline: '2026-11-30',
    priority: 'Tinggi',
    status: 'Belum Selesai',
    completed: false,
    estimatedHours: 4,
    notes: 'Lengkapi fitur CRUD, penerapan TypeScript, .env, branch Git, dan dokumen pengumpulan.',
    createdAt: '2026-11-24T08:00:00.000Z',
  },
  {
    id: 'task-rpl-05',
    title: 'Diagram Use Case dan Activity Sistem Perpustakaan',
    course: 'Rekayasa Perangkat Lunak',
    deadline: '2026-12-02',
    priority: 'Sedang',
    status: 'Belum Selesai',
    completed: false,
    estimatedHours: 2,
    notes: 'Revisi skenario peminjaman buku dan validasi denda keterlambatan.',
    createdAt: '2026-11-23T10:30:00.000Z',
  },
  {
    id: 'task-bdl-04',
    title: 'Latihan Query Indexing dan Optimasi SQL',
    course: 'Basis Data Lanjut',
    deadline: '2026-11-25',
    priority: 'Rendah',
    status: 'Selesai',
    completed: true,
    estimatedHours: 1.5,
    notes: 'Sudah dikumpulkan melalui LMS kelas.',
    createdAt: '2026-11-20T14:15:00.000Z',
  },
];

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  Tinggi: 3,
  Sedang: 2,
  Rendah: 1,
};

export function validateTaskInput(input: TaskInput): string | null {
  if (input.title.trim().length < 3) {
    return 'Judul tugas minimal 3 karakter.';
  }
  if (input.course.trim().length < 2) {
    return 'Nama mata kuliah wajib diisi.';
  }
  if (!input.deadline.trim()) {
    return 'Tanggal tenggat waktu wajib dipilih.';
  }
  if (!Number.isFinite(input.estimatedHours) || input.estimatedHours <= 0 || input.estimatedHours > 100) {
    return 'Estimasi jam kerja harus di antara 0.5 hingga 100 jam.';
  }
  return null;
}

export function createTask(tasks: readonly CourseTask[], input: TaskInput): ActionResult<CourseTask[]> {
  const error = validateTaskInput(input);
  if (error) {
    return { ok: false, error };
  }

  const nextTask: CourseTask = {
    id: nanoid(8),
    title: input.title.trim(),
    course: input.course.trim(),
    deadline: input.deadline.trim(),
    priority: input.priority,
    status: 'Belum Selesai',
    completed: false,
    estimatedHours: Number(input.estimatedHours),
    notes: input.notes.trim(),
    createdAt: new Date().toISOString(),
  };

  return { ok: true, data: [nextTask, ...tasks] };
}

export function updateTask(
  tasks: readonly CourseTask[],
  id: string,
  input: TaskInput
): ActionResult<CourseTask[]> {
  const error = validateTaskInput(input);
  if (error) {
    return { ok: false, error };
  }

  const exists = tasks.some((item) => item.id === id);
  if (!exists) {
    return { ok: false, error: 'Tugas yang ingin diperbarui tidak ditemukan.' };
  }

  const updated = tasks.map((item) =>
    item.id === id
      ? {
          ...item,
          title: input.title.trim(),
          course: input.course.trim(),
          deadline: input.deadline.trim(),
          priority: input.priority,
          estimatedHours: Number(input.estimatedHours),
          notes: input.notes.trim(),
        }
      : item
  );

  return { ok: true, data: updated };
}

export function deleteTask(tasks: readonly CourseTask[], id: string): CourseTask[] {
  return filterItems(tasks, (item) => item.id !== id);
}

export function toggleTaskStatus(tasks: readonly CourseTask[], id: string): CourseTask[] {
  return tasks.map((item) => {
    if (item.id !== id) {
      return item;
    }
    const nextCompleted: boolean = !item.completed;
    const nextStatus: TaskStatus = nextCompleted ? 'Selesai' : 'Belum Selesai';
    return {
      ...item,
      completed: nextCompleted,
      status: nextStatus,
    };
  });
}

export function queryTasks(
  tasks: readonly CourseTask[],
  statusFilter: StatusFilter,
  searchQuery: string
): CourseTask[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = filterItems(tasks, (task) => {
    const matchesStatus = statusFilter === 'Semua' || task.status === statusFilter;
    if (!matchesStatus) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return (
      task.title.toLowerCase().includes(normalizedQuery) ||
      task.course.toLowerCase().includes(normalizedQuery) ||
      task.notes.toLowerCase().includes(normalizedQuery)
    );
  });

  // Pending tasks appear first, ordered by nearest deadline then higher priority.
  return sortItems(filtered, (a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    if (a.deadline !== b.deadline) {
      return a.deadline.localeCompare(b.deadline);
    }
    return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
  });
}

export function calculateSummary(tasks: readonly CourseTask[]): TaskSummary {
  const total: number = tasks.length;
  const done: number = filterItems(tasks, (task) => task.completed).length;
  const pending: number = total - done;
  const completionRate: number = total === 0 ? 0 : Math.round((done / total) * 100);

  return { total, pending, done, completionRate };
}
