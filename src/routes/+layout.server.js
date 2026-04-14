import { env } from '$env/dynamic/private';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
	return {
		has_backend: !env.VERCEL,
		is_admin: !!locals.is_admin
	};
}