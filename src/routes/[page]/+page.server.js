import { get_document } from '$lib/api.remote.js';

export async function load({ params }) {
	const doc = await get_document(params.page);
	console.log('doc', doc);
	return {
		doc
	};
}
