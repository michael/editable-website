import { VERCEL } from '$app/env/private';
import type { PageServerLoad } from './$types';

// The Vercel static build renders the default site once. Node deployments stay
// dynamic so database-backed home pages can update without a rebuild.
export const prerender = !!VERCEL;

// Deliberately no `await parent()` here: depending on layout data would rerun
// this load (and rebuild the editing session) whenever the layout is
// invalidated, e.g. for the favicon refresh after a save. has_backend and
// is_admin reach the page via the layout data merge.
export const load: PageServerLoad = async () => {
	if (VERCEL) {
		return {
			document: null,
			slug: null
		};
	}

	const { get_home_document } = await import('#lib/api.remote.js');
	return await get_home_document();
};
