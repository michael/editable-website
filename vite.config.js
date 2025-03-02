import { sveltekit } from '@sveltejs/kit/vite';

const config = {
  plugins: [sveltekit()],
  build: {
    rollupOptions: {
      external: ['node:sqlite'],
    }
  }
};

export default config;
