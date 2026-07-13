// Discovery and pathname lookup for configured markdown pages.
//
// All repository markdown content lives below the conventional `content/`
// directory. The eager raw glob makes the files part of Vite's module graph,
// so edits reload in development and production builds embed the content.

import { MARKDOWN_SOURCES } from '$lib/content_config.js';
import { validate_markdown_sources } from './config.js';

const markdown_files = import.meta.glob('/content/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

/**
 * Build a pathname index from validated mappings and discovered files.
 * Exported for tests; the module-level registry below is built at startup so
 * configuration errors fail the dev server or production build immediately.
 *
 * @param {unknown} sources - Raw MARKDOWN_SOURCES value
 * @param {Record<string, unknown>} files - Glob result keyed by `/content/...` path
 * @returns {Map<string, { source: string, pathname: string, toc: boolean, markdown: string }>}
 */
export function build_registry(sources, files) {
	const entries = validate_markdown_sources(sources);
	const registry = new Map();

	for (const entry of entries) {
		const file_key = `/content/${entry.source}`;
		const markdown = files[file_key];
		if (typeof markdown !== 'string') {
			throw new Error(
				`MARKDOWN_SOURCES entry "${entry.source}" has no matching file at content/${entry.source}.`
			);
		}
		registry.set(entry.pathname, { ...entry, markdown });
	}

	return registry;
}

const registry = build_registry(MARKDOWN_SOURCES, markdown_files);

/**
 * Look up a configured markdown page by URL pathname.
 *
 * @param {string} pathname - Normalized pathname such as "/manual"
 * @returns {{ source: string, pathname: string, toc: boolean, markdown: string } | null}
 */
export function get_markdown_page(pathname) {
	return registry.get(pathname) ?? null;
}
