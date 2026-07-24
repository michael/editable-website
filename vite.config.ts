/// <reference types="vitest/config" />
import adapter_node from '@sveltejs/adapter-node';
import adapter_vercel from '@sveltejs/adapter-vercel';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const adapter = process.env.VERCEL ? adapter_vercel : adapter_node;

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter(),
			experimental: {
				remoteFunctions: true,
				explicitEnvironmentVariables: true
			},
			// alias: {
			// 	svedit: '../svedit/src/lib/index.ts'
			// },
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
	},
	test: {
		include: ['src/**/*.test.ts']
	}
});
