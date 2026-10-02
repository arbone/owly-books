import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/open-library': {
        target: 'https://openlibrary.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/open-library/, ''),
      },
    },
  },
});
