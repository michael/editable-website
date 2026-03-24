import adapter_auto from '@sveltejs/adapter-auto';
import adapter_node from '@sveltejs/adapter-node';

const adapter = process.env.VERCEL ? adapter_auto : adapter_node;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		experimental: {
			remoteFunctions: true
		}
		// alias: {
		// 	'svedit': '../svedit/src/lib/index.js',
		// }
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
