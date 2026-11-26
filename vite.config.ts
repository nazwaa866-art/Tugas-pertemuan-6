import { defineConfig } from 'vite';

// Relative base ensures assets resolve on both root domains and GitHub Pages subpaths.
export default defineConfig({
  base: './',
  css: {
    postcss: {
      plugins: [],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
