/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	const parent_data = await parent();
	const has_backend = parent_data.has_backend;
	const is_admin = parent_data.is_admin ?? false;

	if (!has_backend) {
		return {
			has_backend,
			is_admin,
			document: null,
			slug: null
		};
	}

	const { get_home_document } = await import('$lib/api.remote.js');
	const result = await get_home_document();

	return {
		...result,
		has_backend,
		is_admin
	};
}
