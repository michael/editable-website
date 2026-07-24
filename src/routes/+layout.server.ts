import { ORIGIN, VERCEL } from '$app/env/private';
import { demo_doc } from '$lib/demo_doc.js';
import { extract_site_metadata } from '$lib/page_metadata.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, depends }) => {
	// Re-derived after saving a page, so favicon and site name update live.
	depends('app:site_metadata');

	const has_backend = !VERCEL;

	let site_metadata;
	if (has_backend) {
		const { get_site_metadata } = await import('$lib/api.remote.js');
		site_metadata = await get_site_metadata();
	} else {
		site_metadata = extract_site_metadata(demo_doc);
	}

	return {
		has_backend,
		is_admin: !!locals.is_admin,
		origin: ORIGIN,
		favicon: site_metadata.favicon
	};
};
