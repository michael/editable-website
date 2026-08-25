import { ORIGIN, VERCEL } from '$app/env/private';
import { default_site_document } from '#app/default_site.js';
import { extract_site_metadata } from '#app/page_metadata.js';
import type { LayoutServerLoad } from './$types';

// Static hosts resolve directory indexes reliably, while Node deployments keep
// the existing no-trailing-slash URLs for database-backed routes.
export const trailingSlash = VERCEL ? 'always' : 'never';

export const load: LayoutServerLoad = async ({ locals, depends }) => {
	// Re-derived after saving a page, so favicon and site name update live.
	depends('app:site_metadata');

	const has_backend = !VERCEL;

	let site_metadata;
	if (has_backend) {
		const { get_site_metadata } = await import('#app/api.remote.js');
		site_metadata = await get_site_metadata();
	} else {
		site_metadata = extract_site_metadata(default_site_document);
	}

	return {
		has_backend,
		is_admin: !!locals.is_admin,
		origin: ORIGIN,
		favicon: site_metadata.favicon
	};
};
