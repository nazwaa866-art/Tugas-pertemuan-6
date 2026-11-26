import './styles/main.css';
import { renderDocumentationSection } from './components/docsSection';
import { loadAppConfig } from './config/env';
import {
  COURSE_SUGGESTIONS,
  INITIAL_TASKS,
  calculateSummary,
  createTask,
  deleteTask,
  queryTasks,
  toggleTaskStatus,
  updateTask,
} from './services/taskManager';
import type { ActiveTab, CourseTask, StatusFilter, TaskPriority } from './types/task';
import { LocalRepository } from './utils/collection';

const appConfig = loadAppConfig();
const taskRepository = new LocalRepository<CourseTask>('paw_p6_nazwa_tasks_v1');

interface AppState {
  activeTab: ActiveTab;
  tasks: CourseTask[];
  statusFilter: StatusFilter;
  searchQuery: string;
  editingId: string | null;
  feedback: { type: 'error' | 'success'; message: string } | null;
}

const state: AppState = {
  activeTab: 'tugas',
  tasks: taskRepository.load(INITIAL_TASKS),
  statusFilter: 'Semua',
  searchQuery: '',
  editingId: null,
  feedback: null,
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDeadline(isoDate: string): string {
  if (!isoDate) {
    return '-';
  }
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function persistAndRender(): void {
  taskRepository.save(state.tasks);
  render();
}

function renderTaskForm(): string {
  const editingTask = state.editingId ? taskRepository.findById(state.tasks, state.editingId) : undefined;
  const heading = editingTask ? 'Edit Tugas Kuliah' : 'Tambah Tugas Baru';
  const desc = editingTask
    ? 'Perbarui detail tugas yang dipilih, lalu simpan perubahan.'
    : 'Catat tugas mata kuliah baru beserta tenggat waktu dan estimasi pengerjaan.';

  const feedbackHtml = state.feedback
    ? `<div class="feedback-banner ${state.feedback.type}" role="status" aria-live="polite">${escapeHtml(
        state.feedback.message
      )}</div>`
    : '';

  const courseOptions = COURSE_SUGGESTIONS.map(
    (name) => `<option value="${escapeHtml(name)}"></option>`
  ).join('');

  return `
    <section class="panel" aria-labelledby="form-heading">
      <h2 id="form-heading" class="panel-heading">${heading}</h2>
      <p class="panel-desc">${desc}</p>
      ${feedbackHtml}
      <form id="task-form" class="task-form" novalidate>
        <div class="field-group">
          <label for="task-title">Judul Tugas</label>
          <input
            id="task-title"
            name="title"
            type="text"
            required
            placeholder="Contoh: Laporan Praktikum Basis Data"
            value="${escapeHtml(editingTask?.title ?? '')}"
          />
        </div>

        <div class="field-group">
          <label for="task-course">Mata Kuliah</label>
          <input
            id="task-course"
            name="course"
            type="text"
            list="course-suggestions"
            required
            placeholder="Contoh: Pengembangan Aplikasi Web"
            value="${escapeHtml(editingTask?.course ?? '')}"
          />
          <datalist id="course-suggestions">${courseOptions}</datalist>
        </div>

        <div class="field-row">
          <div class="field-group">
            <label for="task-deadline">Tenggat Waktu</label>
            <input
              id="task-deadline"
              name="deadline"
              type="date"
              required
              value="${escapeHtml(editingTask?.deadline ?? '2026-12-01')}"
            />
          </div>

          <div class="field-group">
            <label for="task-hours">Estimasi (Jam)</label>
            <input
              id="task-hours"
              name="estimatedHours"
              type="number"
              min="0.5"
              max="100"
              step="0.5"
              required
              value="${editingTask ? String(editingTask.estimatedHours) : '2'}"
            />
          </div>
        </div>

        <div class="field-group">
          <label for="task-priority">Prioritas</label>
          <select id="task-priority" name="priority">
            ${(['Tinggi', 'Sedang', 'Rendah'] as TaskPriority[])
              .map(
                (level) =>
                  `<option value="${level}" ${
                    (editingTask?.priority ?? 'Sedang') === level ? 'selected' : ''
                  }>${level}</option>`
              )
              .join('')}
          </select>
        </div>

        <div class="field-group">
          <label for="task-notes">Catatan Tambahan</label>
          <textarea
            id="task-notes"
            name="notes"
            placeholder="Ketentuan pengumpulan, referensi, atau pembagian tugas..."
          >${escapeHtml(editingTask?.notes ?? '')}</textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            ${editingTask ? 'Simpan Perubahan' : 'Tambahkan Tugas'}
          </button>
          ${
            editingTask
              ? '<button type="button" id="cancel-edit-btn" class="btn btn-secondary">Batal Edit</button>'
              : ''
          }
        </div>
      </form>
    </section>
  `;
}

function renderTaskList(): string {
  const visibleTasks = queryTasks(state.tasks, state.statusFilter, state.searchQuery);
  const filters: StatusFilter[] = ['Semua', 'Belum Selesai', 'Selesai'];

  const filterButtons = filters
    .map(
      (option) => `
        <button
          type="button"
          class="filter-btn"
          data-filter="${option}"
          aria-pressed="${state.statusFilter === option}"
        >
          ${option}
        </button>
      `
    )
    .join('');

  const listBody =
    visibleTasks.length === 0
      ? `
        <div class="empty-state">
          <h3>Tidak ada tugas yang sesuai</h3>
          <p>
            ${
              state.tasks.length === 0
                ? 'Daftar tugas kuliah masih kosong. Tambahkan tugas baru melalui formulir di samping.'
                : 'Filter status atau kata kunci pencarian tidak menemukan tugas yang cocok.'
            }
          </p>
          ${
            state.statusFilter !== 'Semua' || state.searchQuery.trim() !== ''
              ? '<button type="button" id="reset-filter-btn" class="btn btn-secondary">Tampilkan Semua Tugas</button>'
              : ''
          }
        </div>
      `
      : `
        <ul class="task-list">
          ${visibleTasks
            .map(
              (task) => `
                <li class="task-card ${task.completed ? 'is-done' : ''}">
                  <div class="task-top">
                    <div>
                      <h3 class="task-title">${escapeHtml(task.title)}</h3>
                      <p class="task-course">${escapeHtml(task.course)}</p>
                    </div>
                    <span class="status-tag ${task.completed ? 'done' : 'pending'}">
                      ${escapeHtml(task.status)}
                    </span>
                  </div>
                  <div class="task-meta">
                    <span>Tenggat: ${escapeHtml(formatDeadline(task.deadline))}</span>
                    <span>Prioritas: ${escapeHtml(task.priority)}</span>
                    <span>Estimasi: ${task.estimatedHours} jam</span>
                  </div>
                  ${task.notes ? `<p class="task-notes">${escapeHtml(task.notes)}</p>` : ''}
                  <div class="task-actions">
                    <button
                      type="button"
                      class="btn btn-primary"
                      data-action="toggle"
                      data-id="${escapeHtml(task.id)}"
                    >
                      ${task.completed ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                    </button>
                    <button
                      type="button"
                      class="btn btn-secondary"
                      data-action="edit"
                      data-id="${escapeHtml(task.id)}"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      class="btn btn-danger"
                      data-action="delete"
                      data-id="${escapeHtml(task.id)}"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              `
            )
            .join('')}
        </ul>
      `;

  return `
    <section class="panel" aria-labelledby="list-heading">
      <h2 id="list-heading" class="panel-heading">Daftar Tugas Kuliah</h2>
      <p class="panel-desc">Kelola progres tugas berdasarkan status dan tenggat terdekat.</p>
      <div class="list-toolbar">
        <div class="filter-group" role="group" aria-label="Filter status tugas">
          ${filterButtons}
        </div>
        <input
          id="search-input"
          class="search-input"
          type="search"
          aria-label="Cari tugas atau mata kuliah"
          placeholder="Cari judul atau mata kuliah..."
          value="${escapeHtml(state.searchQuery)}"
        />
      </div>
      ${listBody}
    </section>
  `;
}

function render(): void {
  const root = document.querySelector<HTMLDivElement>('#app');
  if (!root) {
    return;
  }

  const summary = calculateSummary(state.tasks);

  root.innerHTML = `
    <div class="page-shell">
      <header class="site-header">
        <div class="brand-block">
          <p class="meta-line">
            ${escapeHtml(appConfig.courseName)} (${escapeHtml(appConfig.semester)}) | v${escapeHtml(
              appConfig.appVersion
            )}
          </p>
          <h1 class="site-title">${escapeHtml(appConfig.appName)}</h1>
          <p class="site-subtitle">
            Website pribadi ${escapeHtml(appConfig.authorName)} (NIM ${escapeHtml(
              appConfig.authorNim
            )}, Kelas ${escapeHtml(appConfig.authorClass)}) untuk mengelola daftar tugas kuliah dengan TypeScript dan Vite.
          </p>
        </div>

        <nav class="site-nav" aria-label="Navigasi utama">
          <button
            type="button"
            class="nav-btn"
            data-tab="tugas"
            aria-pressed="${state.activeTab === 'tugas'}"
          >
            Daftar Tugas
          </button>
          <button
            type="button"
            class="nav-btn"
            data-tab="dokumentasi"
            aria-pressed="${state.activeTab === 'dokumentasi'}"
          >
            Materi Pertemuan 6
          </button>
        </nav>
      </header>

      <main>
        ${
          state.activeTab === 'tugas'
            ? `
              <section class="summary-strip" aria-label="Ringkasan jumlah tugas">
                <div class="summary-cell">
                  <span class="summary-label">Total Tugas</span>
                  <span class="summary-value">${summary.total}</span>
                </div>
                <div class="summary-cell">
                  <span class="summary-label">Belum Selesai</span>
                  <span class="summary-value">${summary.pending}</span>
                </div>
                <div class="summary-cell">
                  <span class="summary-label">Selesai</span>
                  <span class="summary-value">${summary.done}</span>
                </div>
                <div class="summary-cell">
                  <span class="summary-label">Progres Selesai</span>
                  <span class="summary-value">${summary.completionRate}%</span>
                </div>
              </section>

              <div class="workspace-grid">
                ${renderTaskForm()}
                ${renderTaskList()}
              </div>
            `
            : renderDocumentationSection(appConfig)
        }
      </main>

      <footer class="site-footer">
        <span>${escapeHtml(appConfig.authorName)} | NIM ${escapeHtml(appConfig.authorNim)} | Kelas ${escapeHtml(
          appConfig.authorClass
        )}</span>
        <span>${escapeHtml(appConfig.appName)} v${escapeHtml(appConfig.appVersion)}</span>
      </footer>
    </div>
  `;

  bindEvents();
}

function bindEvents(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeTab = (button.dataset.tab ?? 'tugas') as ActiveTab;
      render();
    });
  });

  const form = document.querySelector<HTMLFormElement>('#task-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const input = {
      title: String(formData.get('title') ?? ''),
      course: String(formData.get('course') ?? ''),
      deadline: String(formData.get('deadline') ?? ''),
      priority: String(formData.get('priority') ?? 'Sedang') as TaskPriority,
      estimatedHours: Number(formData.get('estimatedHours') ?? 0),
      notes: String(formData.get('notes') ?? ''),
    };

    if (state.editingId) {
      const result = updateTask(state.tasks, state.editingId, input);
      if (!result.ok || !result.data) {
        state.feedback = { type: 'error', message: result.error ?? 'Gagal memperbarui tugas.' };
        render();
        return;
      }
      state.tasks = result.data;
      state.editingId = null;
      state.feedback = { type: 'success', message: 'Perubahan tugas berhasil disimpan.' };
      persistAndRender();
      return;
    }

    const result = createTask(state.tasks, input);
    if (!result.ok || !result.data) {
      state.feedback = { type: 'error', message: result.error ?? 'Gagal menambahkan tugas.' };
      render();
      return;
    }
    state.tasks = result.data;
    state.feedback = { type: 'success', message: 'Tugas baru berhasil ditambahkan.' };
    persistAndRender();
  });

  document.querySelector<HTMLButtonElement>('#cancel-edit-btn')?.addEventListener('click', () => {
    state.editingId = null;
    state.feedback = null;
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      state.statusFilter = (button.dataset.filter ?? 'Semua') as StatusFilter;
      render();
    });
  });

  const searchInput = document.querySelector<HTMLInputElement>('#search-input');
  searchInput?.addEventListener('input', () => {
    state.searchQuery = searchInput.value;
    const caret = searchInput.selectionStart ?? searchInput.value.length;
    render();
    const nextInput = document.querySelector<HTMLInputElement>('#search-input');
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(caret, caret);
    }
  });

  document.querySelector<HTMLButtonElement>('#reset-filter-btn')?.addEventListener('click', () => {
    state.statusFilter = 'Semua';
    state.searchQuery = '';
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const id = button.dataset.id;
      if (!id) {
        return;
      }

      if (action === 'toggle') {
        state.tasks = toggleTaskStatus(state.tasks, id);
        state.feedback = { type: 'success', message: 'Status tugas berhasil diperbarui.' };
        persistAndRender();
      } else if (action === 'edit') {
        state.editingId = id;
        state.feedback = null;
        render();
        document.querySelector<HTMLInputElement>('#task-title')?.focus();
      } else if (action === 'delete') {
        state.tasks = deleteTask(state.tasks, id);
        if (state.editingId === id) {
          state.editingId = null;
        }
        state.feedback = { type: 'success', message: 'Tugas telah dihapus dari daftar.' };
        persistAndRender();
      }
    });
  });
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && state.editingId) {
    state.editingId = null;
    state.feedback = null;
    render();
  }
});

render();
