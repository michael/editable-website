// Table-of-contents selection for converted markdown documents.
//
// The TOC lists the headings one level below the document's first heading
// (typical manual.md: a single `#` title followed by `##` chapters), and is
// inserted directly before the first of those headings — after the title and
// any intro prose.

/**
 * Pick the headings a table of contents should link to.
 *
 * @param {{ id: string, depth: number, container: string[] }[]} headings -
 *   Converted headings in document order; `container` is the prose body array
 *   holding the heading id.
 * @returns {{ targets: { id: string, depth: number }[], insert_before: { id: string, container: string[] } } | null}
 *   Null when the document has no meaningful TOC (fewer than two chapter
 *   headings).
 */
export function select_toc_headings(headings) {
	if (headings.length === 0) return null;

	const first_depth = headings[0].depth;
	const deeper = headings.filter((heading) => heading.depth > first_depth);
	if (deeper.length === 0) return null;

	const toc_depth = Math.min(...deeper.map((heading) => heading.depth));
	const targets = headings.filter((heading) => heading.depth === toc_depth);
	if (targets.length < 2) return null;

	return {
		targets,
		insert_before: { id: targets[0].id, container: targets[0].container }
	};
}
