import { defineConfig } from 'vite';

// `base: './'` keeps every asset path relative, so the same build works at
// https://<user>.github.io/ (a user page) or https://<user>.github.io/<repo>/ (a project page).
export default defineConfig({
  base: './',
  build: { outDir: 'dist', assetsInlineLimit: 0 },
  server: { port: 5180, host: '127.0.0.1' },
});
