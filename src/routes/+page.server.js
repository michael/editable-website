import { get_home_document } from '$lib/api.remote.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	const parent_data = await parent();
	const has_backend = parent_data.has_backend;

	if (!has_backend) {
		return {
			has_backend,
			document: null,
			slug: null
		};
	}

	const result = await get_home_document();

	return {
		has_backend,
		document: result?.document ?? null,
		slug: result?.slug ?? null
	};
}