import type { AppEnvironmentConfig } from '../types/task';

export function renderDocumentationSection(config: AppEnvironmentConfig): string {
  return `
    <section class="docs-layout" aria-labelledby="docs-heading">
      <div class="docs-intro">
        <h2 id="docs-heading">Dokumentasi Pertemuan 6: Git, npm, TypeScript, Vite, dan Environment Variables</h2>
        <p>
          Halaman ini merangkum penerapan alat pengembangan web modern yang digunakan untuk membangun
          aplikasi ${config.appName} oleh ${config.authorName} (NIM ${config.authorNim}, Kelas ${config.authorClass}).
        </p>
      </div>

      <div class="docs-grid">
        <article class="doc-article">
          <h3>1. Git dan GitHub</h3>
          <p>
            Git mencatat setiap perubahan kode secara bertahap melalui commit sehingga riwayat proyek mudah ditelusuri.
            GitHub menyimpan repository jarak jauh agar kode dapat disinkronkan melalui push dan pull, ditinjau lewat Pull Request,
            serta dideploy ke web.
          </p>
          <ul>
            <li><strong>Branching:</strong> fitur dikerjakan di branch terpisah seperti <span class="code-chip">feature/task-manager</span> dan <span class="code-chip">feature/docs-section</span> agar branch <span class="code-chip">main</span> tetap stabil.</li>
            <li><strong>Merge dan Conflict:</strong> penggabungan dua branch yang mengubah baris yang sama memicu merge conflict yang diselesaikan secara manual sebelum commit ulang.</li>
            <li><strong>.gitignore:</strong> mengecualikan <span class="code-chip">node_modules/</span>, <span class="code-chip">dist/</span>, dan file <span class="code-chip">.env</span> agar tidak ikut terunggah ke GitHub.</li>
          </ul>
        </article>

        <article class="doc-article">
          <h3>2. npm, package.json, dan Semantic Versioning</h3>
          <p>
            npm (Node Package Manager) mengelola pustaka pihak ketiga dan skrip otomasi melalui file <span class="code-chip">package.json</span>.
          </p>
          <ul>
            <li><strong>dependencies:</strong> paket yang dibutuhkan saat aplikasi berjalan di browser, misalnya <span class="code-chip">nanoid</span> untuk membuat ID tugas unik.</li>
            <li><strong>devDependencies:</strong> alat bantu selama pengembangan dan pengujian, yaitu <span class="code-chip">typescript</span>, <span class="code-chip">vite</span>, dan <span class="code-chip">vitest</span>.</li>
            <li><strong>Semantic Versioning (MAJOR.MINOR.PATCH):</strong> contoh <span class="code-chip">^6.3.5</span> mengizinkan pembaruan minor dan patch yang masih kompatibel, sedangkan <span class="code-chip">~</span> membatasi hanya pada pembaruan patch.</li>
            <li><strong>npm scripts:</strong> <span class="code-chip">npm run dev</span>, <span class="code-chip">npm test</span>, <span class="code-chip">npm run typecheck</span>, dan <span class="code-chip">npm run build</span>.</li>
          </ul>
        </article>

        <article class="doc-article">
          <h3>3. Penerapan TypeScript</h3>
          <p>
            TypeScript menambahkan pemeriksaan tipe statis di atas JavaScript sehingga kesalahan penamaan properti,
            tipe parameter, atau nilai kosong dapat ditemukan sebelum aplikasi dijalankan di browser.
          </p>
          <ul>
            <li><strong>Primitive types:</strong> <span class="code-chip">string</span>, <span class="code-chip">number</span>, dan <span class="code-chip">boolean</span> pada data tugas dan konfigurasi.</li>
            <li><strong>Array:</strong> <span class="code-chip">CourseTask[]</span> untuk daftar tugas dan <span class="code-chip">string[]</span> untuk saran mata kuliah.</li>
            <li><strong>Interface:</strong> <span class="code-chip">CourseTask</span>, <span class="code-chip">TaskInput</span>, <span class="code-chip">TaskSummary</span>, dan <span class="code-chip">AppEnvironmentConfig</span>.</li>
            <li><strong>Type alias dan Union type:</strong> <span class="code-chip">TaskStatus = 'Belum Selesai' | 'Selesai'</span> serta <span class="code-chip">TaskPriority = 'Rendah' | 'Sedang' | 'Tinggi'</span>.</li>
            <li><strong>Generics:</strong> fungsi <span class="code-chip">filterItems&lt;T&gt;</span>, <span class="code-chip">sortItems&lt;T&gt;</span>, dan kelas <span class="code-chip">LocalRepository&lt;T extends { id: string }&gt;</span>.</li>
          </ul>
        </article>

        <article class="doc-article">
          <h3>4. Environment Variables (.env)</h3>
          <p>
            Konfigurasi lingkungan disimpan di file <span class="code-chip">.env</span> lokal dan didokumentasikan lewat
            <span class="code-chip">.env.example</span>. Pada Vite, hanya variabel berawalan <span class="code-chip">VITE_</span>
            yang diteruskan ke kode sisi klien.
          </p>
          <ul>
            <li><strong>Keamanan:</strong> password, token akses, dan API key rahasia tidak boleh memakai prefix <span class="code-chip">VITE_</span> dan tidak boleh diunggah ke GitHub.</li>
            <li><strong>Konfigurasi aktif saat ini:</strong> <span class="code-chip">VITE_APP_NAME="${config.appName}"</span>, <span class="code-chip">VITE_APP_VERSION="${config.appVersion}"</span>, <span class="code-chip">VITE_AUTHOR_NIM="${config.authorNim}"</span>.</li>
          </ul>
        </article>

        <article class="doc-article full-span">
          <h3>5. Vite serta Peran Compiler, Transpiler, dan Bundler</h3>
          <p>
            Browser hanya mengeksekusi JavaScript standar, HTML, dan CSS. Karena aplikasi ini ditulis dalam TypeScript modular,
            diperlukan rangkaian alat build agar kode dapat diperiksa, diterjemahkan, dan dikemas dengan efisien.
          </p>
          <div class="table-wrap">
            <table class="info-table">
              <thead>
                <tr>
                  <th>Peran</th>
                  <th>Alat di Proyek Ini</th>
                  <th>Tugas Utama</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Compiler / Type Checker</strong></td>
                  <td><span class="code-chip">tsc --noEmit</span> (TypeScript Compiler)</td>
                  <td>Memeriksa kecocokan tipe data, interface, union type, dan generics di seluruh file <span class="code-chip">.ts</span> sebelum proses build produksi dijalankan.</td>
                </tr>
                <tr>
                  <td><strong>Transpiler</strong></td>
                  <td>esbuild (di dalam Vite)</td>
                  <td>Menerjemahkan sintaks TypeScript menjadi JavaScript modern (ESNext) yang langsung dipahami browser dengan waktu kompilasi sangat cepat saat <span class="code-chip">npm run dev</span>.</td>
                </tr>
                <tr>
                  <td><strong>Bundler</strong></td>
                  <td>Rollup (di dalam <span class="code-chip">vite build</span>)</td>
                  <td>Menggabungkan seluruh modul JavaScript, CSS, dan aset ke folder <span class="code-chip">dist/</span>, melakukan minifikasi serta tree-shaking agar ukuran file produksi ringan saat diakses online.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  `;
}
