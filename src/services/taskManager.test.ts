import { describe, expect, it } from 'vitest';
import {
  INITIAL_TASKS,
  calculateSummary,
  createTask,
  deleteTask,
  queryTasks,
  toggleTaskStatus,
  updateTask,
} from './taskManager';
import { LocalRepository, filterItems } from '../utils/collection';
import type { CourseTask } from '../types/task';

describe('taskManager', () => {
  it('menambahkan tugas kuliah baru dengan validasi benar', () => {
    const result = createTask(INITIAL_TASKS, {
      title: 'Presentasi Arsitektur Web Modern',
      course: 'Pengembangan Aplikasi Web',
      deadline: '2026-12-05',
      priority: 'Tinggi',
      estimatedHours: 3,
      notes: 'Siapkan slide dan demo aplikasi.',
    });

    expect(result.ok).toBe(true);
    expect(result.data).toHaveLength(INITIAL_TASKS.length + 1);
    expect(result.data?.[0].status).toBe('Belum Selesai');
    expect(result.data?.[0].completed).toBe(false);
  });

  it('menolak input tugas yang tidak valid', () => {
    const result = createTask(INITIAL_TASKS, {
      title: 'AB',
      course: 'PAW',
      deadline: '2026-12-05',
      priority: 'Sedang',
      estimatedHours: 2,
      notes: '',
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain('minimal 3 karakter');
  });

  it('mengedit detail tugas yang sudah ada', () => {
    const result = updateTask(INITIAL_TASKS, 'task-paw-06', {
      title: 'Tugas Pertemuan 6 (Revisi Final)',
      course: 'Pengembangan Aplikasi Web',
      deadline: '2026-12-01',
      priority: 'Tinggi',
      estimatedHours: 5,
      notes: 'Sudah ditambahkan unit test.',
    });

    expect(result.ok).toBe(true);
    const updated = result.data?.find((item) => item.id === 'task-paw-06');
    expect(updated?.title).toBe('Tugas Pertemuan 6 (Revisi Final)');
    expect(updated?.estimatedHours).toBe(5);
  });

  it('mengubah status tugas antara Belum Selesai dan Selesai', () => {
    const toggled = toggleTaskStatus(INITIAL_TASKS, 'task-paw-06');
    const target = toggled.find((item) => item.id === 'task-paw-06');
    expect(target?.completed).toBe(true);
    expect(target?.status).toBe('Selesai');
  });

  it('menghapus tugas berdasarkan id', () => {
    const remaining = deleteTask(INITIAL_TASKS, 'task-bdl-04');
    expect(remaining).toHaveLength(INITIAL_TASKS.length - 1);
    expect(remaining.some((item) => item.id === 'task-bdl-04')).toBe(false);
  });

  it('menyaring dan menghitung ringkasan tugas', () => {
    const onlyDone = queryTasks(INITIAL_TASKS, 'Selesai', '');
    expect(onlyDone).toHaveLength(1);
    expect(onlyDone[0].id).toBe('task-bdl-04');

    const summary = calculateSummary(INITIAL_TASKS);
    expect(summary.total).toBe(3);
    expect(summary.done).toBe(1);
    expect(summary.pending).toBe(2);
    expect(summary.completionRate).toBe(33);
  });

  it('mendukung fungsi dan repository generik', () => {
    const highPriority = filterItems(INITIAL_TASKS, (t) => t.priority === 'Tinggi');
    expect(highPriority).toHaveLength(1);

    const memory = new Map<string, string>();
    const repo = new LocalRepository<CourseTask>('test_tasks', {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => {
        memory.set(key, value);
      },
    });

    repo.save(INITIAL_TASKS);
    const loaded = repo.load([]);
    expect(loaded).toHaveLength(INITIAL_TASKS.length);
    expect(repo.findById(loaded, 'task-rpl-05')?.course).toBe('Rekayasa Perangkat Lunak');
  });
});
