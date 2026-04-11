import { get_home_document } from '$lib/api.remote.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	const parent_data = await parent();

	if (!parent_data.has_backend) {
		return {
			document: null,
			slug: null
		};
	}

	const result = await get_home_document();

	return {
		document: result.document,
		slug: result.slug
	};
}