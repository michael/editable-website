/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	const parent_data = await parent();
	const has_backend = parent_data.has_backend;

	if (!has_backend) {
		return {
			has_backend,
			shared_documents: null
		};
	}

	const { get_shared_documents } = await import('$lib/api.remote.js');
	const shared_documents = await get_shared_documents();

	return {
		has_backend,
		shared_documents
	};
}