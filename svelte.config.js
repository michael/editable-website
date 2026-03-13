import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		// experimental: {
		// 	remoteFunctions: true
		// },
		alias: {
			'svedit': '../svedit/src/lib/index.js',
		}
	},
	compilerOptions: {
		// experimental: {
		// 	async: true
		// }
	}
};

export default config;
