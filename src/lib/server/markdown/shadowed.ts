// Detection of database pages whose slug is occupied by a markdown page.
//
// Kept out of registry.js so that module stays database-free — the markdown
// route imports it at module load, including in static/Vercel mode.

import db from '#lib/server/db.js';
import { is_reserved_markdown_slug } from './registry.js';

export type ShadowedPage = {
	slug: string;
	document_id: string;
};

/** Pages that exist in the database but whose URL a markdown page serves. */
export function find_shadowed_pages(): ShadowedPage[] {
	const rows = db
		.prepare(
			`SELECT s.slug, s.document_id
			 FROM document_slugs s
			 JOIN documents d ON d.document_id = s.document_id
			 WHERE s.is_active = 1 AND d.type = 'page'`
		)
		.all() as unknown as ShadowedPage[];

	return rows.filter((row) => is_reserved_markdown_slug(row.slug));
}

/** Log a startup warning for each shadowed page. */
export function warn_about_shadowed_pages(): void {
	for (const page of find_shadowed_pages()) {
		console.warn(
			`Page "/${page.slug}" (${page.document_id}) is shadowed by a markdown page and is ` +
				`unreachable. Change its Page URL, or remove the /${page.slug} entry from MARKDOWN_SOURCES.`
		);
	}
}
