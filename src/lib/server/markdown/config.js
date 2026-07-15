// Validation and normalization of MARKDOWN_SOURCES entries.
//
// Configuration errors throw at startup/build so a misconfigured deployment
// fails fast instead of silently serving the wrong pages.

const ALLOWED_ENTRY_KEYS = new Set(['markdown', 'source', 'pathname', 'toc']);

/**
 * Validate and normalize markdown source mappings.
 *
 * @param {unknown} sources - The raw MARKDOWN_SOURCES value
 * @returns {{ markdown: string, source: string, pathname: string, toc: boolean }[]}
 * @throws {Error} Throws when the configuration is invalid
 */
export function validate_markdown_sources(sources) {
	if (!Array.isArray(sources)) {
		throw new Error('MARKDOWN_SOURCES must be an array.');
	}

	/** @type {{ markdown: string, source: string, pathname: string, toc: boolean }[]} */
	const normalized = [];
	const seen_pathnames = new Set();

	for (const [index, entry] of sources.entries()) {
		const label = `MARKDOWN_SOURCES[${index}]`;

		if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
			throw new Error(`${label} must be an object with markdown, source, and pathname.`);
		}

		for (const key of Object.keys(entry)) {
			if (!ALLOWED_ENTRY_KEYS.has(key)) {
				throw new Error(`${label} has an unknown field "${key}".`);
			}
		}

		if (typeof entry.markdown !== 'string') {
			throw new Error(`${label}.markdown must be the imported file content (use a ?raw import).`);
		}

		// The file's repo-relative path, so conversion errors point straight at
		// the file to fix (e.g. "content/manual.md:585:45").
		if (typeof entry.source !== 'string' || !entry.source.endsWith('.md')) {
			throw new Error(
				`${label}.source must be the file's repo-relative .md path (used in error messages).`
			);
		}

		const pathname = validate_pathname(entry.pathname, label);

		if (entry.toc !== undefined && typeof entry.toc !== 'boolean') {
			throw new Error(`${label}.toc must be a boolean.`);
		}

		if (seen_pathnames.has(pathname)) {
			throw new Error(`${label} duplicates pathname "${pathname}".`);
		}
		seen_pathnames.add(pathname);

		normalized.push({
			markdown: entry.markdown,
			source: entry.source,
			pathname,
			toc: entry.toc === true
		});
	}

	return normalized;
}

/**
 * @param {unknown} pathname
 * @param {string} label
 * @returns {string}
 */
function validate_pathname(pathname, label) {
	if (typeof pathname !== 'string' || pathname.length === 0) {
		throw new Error(`${label}.pathname must be a non-empty string.`);
	}
	if (!pathname.startsWith('/')) {
		throw new Error(`${label}.pathname must be an absolute URL path: "${pathname}".`);
	}
	if (pathname === '/') {
		throw new Error(`${label}.pathname must not claim the home route.`);
	}

	const segment = pathname.slice(1);

	// Single URL segment in the initial implementation, so the existing
	// [page_id] route can resolve it. No nested paths, queries, or fragments.
	if (!/^[a-z0-9][a-z0-9_-]*$/.test(segment)) {
		throw new Error(
			`${label}.pathname must be a single lowercase URL segment like "/manual" ` +
				`(letters, numbers, dashes, underscores): "${pathname}".`
		);
	}

	return pathname;
}
