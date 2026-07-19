import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

// Deliberately no `await parent()` here — see routes/+page.server.ts.
export const load: PageServerLoad = async ({ locals }) => {
	if (env.VERCEL) {
		return {
			shared_documents: null
		};
	}

	if (!locals.is_admin) {
		throw redirect(303, '/');
	}

	const { get_shared_documents } = await import('$lib/api.remote.js');
	const shared_documents = await get_shared_documents();

	return {
		shared_documents
	};
};
