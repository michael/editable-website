// Server/build-only configuration for markdown pages.
//
// Each entry maps one markdown file in the repository to one public URL,
// rendered as a read-only page. Reference the file with a `?raw` import —
// Vite inlines the content at build time and fails the build if the file is
// missing. Any markdown file in the repo works, e.g. the root-level README:
//
//   import manual_md from '../../README.md?raw';
//   { markdown: manual_md, source: 'README.md', pathname: '/manual', toc: true }
//
// - `markdown`: the imported file content
// - `source`: the file's repo-relative path, so error messages point at the file
// - `pathname`: absolute single-segment URL the page is served at
// - `toc` (optional): generate a table of contents from the file's headings
//
// With no entries, the site behaves exactly as if this feature did not exist.
// Do not import this module (or anything under `src/lib/server/`) from client
// code — use `src/lib/config.js` for universal constants instead.
import readme_md from '../../README.md?raw';
import target_groups_md from '../../TARGET_GROUPS.md?raw';
import kitchen_sink_md from '../../content/kitchen-sink.md?raw';
import svedit_md from '../../content/svedit.md?raw';

export const MARKDOWN_SOURCES = [
	// The developer manual is the repository README.
	{ markdown: readme_md, source: 'README.md', pathname: '/manual', toc: true },
	// Audience stories and use cases.
	{
		markdown: target_groups_md,
		source: 'TARGET_GROUPS.md',
		pathname: '/solutions',
		toc: true
	},
	// Demo page exercising every supported markdown construct.
	{
		markdown: kitchen_sink_md,
		source: 'content/kitchen-sink.md',
		pathname: '/kitchen-sink',
		toc: true
	},
	{ markdown: svedit_md, source: 'content/svedit.md', pathname: '/svedit', toc: true }
];
