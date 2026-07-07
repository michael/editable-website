import { env } from '$env/dynamic/private';
import { demo_doc } from '$lib/demo_doc.js';
import { extract_site_metadata } from '$lib/page_metadata.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, depends }) {
	// Re-derived after saving a page, so favicon and site name update live.
	depends('app:site_metadata');

	const has_backend = !env.VERCEL;

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
		origin: env.ORIGIN ?? '',
		site_name: site_metadata.site_name,
		favicon: site_metadata.favicon
	};
}
