import { error, redirect } from '@sveltejs/kit';
import { dev } from '$app/env';
import { VERCEL } from '$app/env/private';
import {
	get_markdown_page,
	get_markdown_page_pathnames
} from '#lib/server/markdown/registry.js';
import { convert_markdown } from '#lib/server/markdown/convert.js';
import { compose_markdown_document } from '#lib/server/markdown/compose.js';
import type { PageServerLoad } from './$types';
import type { Document } from 'svedit';

// Render configured repository pages at build time for the static Vercel
// deployment. Node deployments must keep this route database-backed.
export const prerender = !!VERCEL;

export function entries() {
	if (!VERCEL) return [];
	return get_markdown_page_pathnames().map((pathname) => ({ page_id: pathname.slice(1) }));
}

// Deliberately no `await parent()` here — see routes/+page.server.ts.
export const load: PageServerLoad = async ({ params }) => {
	// Configured markdown pages win over database slugs.
	const markdown_page = get_markdown_page(`/${params.page_id}`);

	if (markdown_page) {
		let document: Document;
		try {
			const shared_documents = await get_shared_site_documents();
			const page_doc = convert_markdown(markdown_page.markdown, markdown_page);
			document = compose_markdown_document(page_doc, shared_documents);
		} catch (err) {
			// Log the detailed error (with filesystem paths) server-side only.
			console.error(`Failed to render markdown page ${markdown_page.pathname}:`, err);
			throw error(500, dev && err instanceof Error ? err.message : 'Failed to render page');
		}

		return {
			document,
			slug: params.page_id,
			can_edit: false,
			content_source: 'markdown'
		};
	}

	try {
		const { get_document } = await import('#app/api.remote.js');
		const result = await get_document(params.page_id);

		if (result.redirect_to_slug) {
			throw redirect(301, `/${result.redirect_to_slug}`);
		}

		return {
			document: result.document,
			slug: result.slug,
			can_edit: true
		};
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(404, 'Page not found');
	}
};

/**
 * Shared nav/footer documents for composing markdown pages: the live database
 * documents when a backend exists, the default site documents on static builds.
 */
async function get_shared_site_documents() {
	if (VERCEL) {
		const { default_nav_document, default_footer_document } = await import('#app/default_site.js');
		return { nav_document: default_nav_document, footer_document: default_footer_document };
	}
	const { get_shared_documents } = await import('#app/api.remote.js');
	return await get_shared_documents();
}
