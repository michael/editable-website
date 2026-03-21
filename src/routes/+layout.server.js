/** @type {import('./$types').LayoutServerLoad} */
export function load() {
	return {
		has_backend: !process.env.VERCEL
	};
}