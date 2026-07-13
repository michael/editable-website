// Server/build-only configuration for filesystem markdown content.
//
// Each entry maps one markdown file below the repository-level `content/`
// directory to one public URL, rendered as a read-only page:
//
//   { source: 'manual.md', pathname: '/manual', toc: true }
//
// - `source`: relative path of a `.md` file below `content/`
// - `pathname`: absolute single-segment URL the page is served at
// - `toc` (optional): generate a table of contents from the file's headings
//
// With no entries, the site behaves exactly as if this feature did not exist.
// Do not import this module (or anything under `src/lib/server/`) from client
// code — use `src/lib/config.js` for universal constants instead.
export const MARKDOWN_SOURCES = [
	// Demo page exercising every supported markdown construct.
	{ source: 'kitchen-sink.md', pathname: '/kitchen-sink', toc: true },
	{ source: 'svedit.md', pathname: '/svedit', toc: true }
];
