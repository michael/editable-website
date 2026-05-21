import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, parent }) {
	const parent_data = await parent();
	const has_backend = parent_data.has_backend;
	const is_admin = parent_data.is_admin ?? false;

	if (!has_backend) {
		throw error(404, 'Page not found');
	}

	try {
		const { get_document } = await import('$lib/api.remote.js');
		const result = await get_document(params.page_id);

		return {
			document: result.document,
			has_backend,
			is_admin
		};
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(404, 'Page not found');
	}
}
