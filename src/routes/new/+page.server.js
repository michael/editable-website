import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	const parent_data = await parent();
	const has_backend = parent_data.has_backend;
	const is_admin = parent_data.is_admin ?? false;

	if (!has_backend) {
		return {
			has_backend,
			is_admin
		};
	}

	if (!is_admin) {
		throw redirect(303, '/');
	}

	return {
		has_backend,
		is_admin
	};
}
