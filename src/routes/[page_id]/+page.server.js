import { error, redirect } from '@sveltejs/kit';
import { get_document } from '$lib/api.remote.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	try {
		const result = await get_document(params.page_id);

		if (result.redirect_to_slug) {
			throw redirect(301, `/${result.redirect_to_slug}`);
		}

		return {
			document: result.document,
			slug: result.slug
		};
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(404, 'Page not found');
	}
}