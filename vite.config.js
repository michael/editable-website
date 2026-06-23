import adapter_auto from '@sveltejs/adapter-auto';
import adapter_node from '@sveltejs/adapter-node';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const adapter = process.env.VERCEL ? adapter_auto : adapter_node;

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter(),
			experimental: {
				remoteFunctions: true
			},
			alias: {
				'svedit': '../svedit/src/lib/index.js',
			},
			compilerOptions: {
				experimental: {
					async: true
				}
			}
		})
	],
	optimizeDeps: {
		exclude: ['@jsquash/webp']
	},
	worker: {
		format: 'es'
	}
});
