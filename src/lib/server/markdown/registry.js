// Pathname lookup for configured markdown pages.
//
// Files are referenced through explicit `?raw` imports in
// `src/lib/content_config.js`, so Vite inlines exactly the mapped files into
// the server bundle, rebuilds on edits in development, and fails the build
// when a referenced file is missing.

import { MARKDOWN_SOURCES } from '$lib/content_config.js';
import { validate_markdown_sources } from './config.js';

/**
 * Build a pathname index from validated mappings.
 * Exported for tests; the module-level registry below is built at startup so
 * configuration errors fail the dev server or production deploy immediately.
 *
 * @param {unknown} sources - Raw MARKDOWN_SOURCES value
 * @returns {Map<string, { markdown: string, source: string, pathname: string, toc: boolean }>}
 */
export function build_registry(sources) {
	const registry = new Map();
	for (const entry of validate_markdown_sources(sources)) {
		registry.set(entry.pathname, entry);
	}
	return registry;
}

const registry = build_registry(MARKDOWN_SOURCES);

/**
 * Look up a configured markdown page by URL pathname.
 *
 * @param {string} pathname - Normalized pathname such as "/manual"
 * @returns {{ markdown: string, source: string, pathname: string, toc: boolean } | null}
 */
export function get_markdown_page(pathname) {
	return registry.get(pathname) ?? null;
}
