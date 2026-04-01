import { error } from '@sveltejs/kit';
import { get_document } from '$lib/api.remote.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	try {
		const document = await get_document(params.page_id);

		return {
			document
		};
	} catch {
		throw error(404, 'Page not found');
	}
}