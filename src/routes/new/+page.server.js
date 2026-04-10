import { get_shared_documents } from '$lib/api.remote.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const shared_documents = await get_shared_documents();

	return {
		shared_documents
	};
}