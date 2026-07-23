import { error, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { get_markdown_page } from '$lib/server/markdown/registry.js';
import { convert_markdown } from '$lib/server/markdown/convert.js';
import { compose_markdown_document } from '$lib/server/markdown/compose.js';
import type { PageServerLoad } from './$types';
import type { Document } from 'svedit';

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
		const { get_document } = await import('$lib/api.remote.js');
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
 * documents when a backend exists, the demo seed documents on static builds.
 */
async function get_shared_site_documents() {
	if (env.VERCEL) {
		const { NAV_1, FOOTER_1 } = await import('$lib/demo_doc.js');
		return { nav_document: NAV_1, footer_document: FOOTER_1 };
	}
	const { get_shared_documents } = await import('$lib/api.remote.js');
	return await get_shared_documents();
}
