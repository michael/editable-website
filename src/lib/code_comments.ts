// Super-simple generic comment detection for read-only code rendering.
//
// No language grammars: if a preformatted text looks like source code, its
// `//` line comments and `/* ... */` (incl. `/** ... */`) block comments are
// split out so the component can render them de-emphasized. Anything else
// renders unchanged. Browser-safe, no imports.

/**
 * Split source-like text into comment and non-comment segments.
 *
 * Returns null when the text does not look like code or contains no
 * comments — callers then render the text as-is. Strings (quoted with
 * ', ", or `) are skipped so a `//` inside them is not mistaken for a
 * comment, and `://` (URLs) never starts one.
 */
export function split_code_comments(text: string): { text: string; comment: boolean }[] | null {
	// `#` comments are only recognized in shell-ish blocks, so hex colors,
	// config files, and markdown headings inside code blocks stay untouched.
	const allow_hash_comments = looks_like_shell(text);
	if (!allow_hash_comments && !looks_like_code(text)) return null;

	const segments: { text: string; comment: boolean }[] = [];
	let normal_start = 0;
	let has_comment = false;
	let i = 0;

	function push_normal(end: number) {
		if (end > normal_start) segments.push({ text: text.slice(normal_start, end), comment: false });
	}

	while (i < text.length) {
		const char = text[i];

		// Skip strings so their contents can't start a comment.
		if (char === "'" || char === '"' || char === '`') {
			const quote_start = i;
			let terminated = false;
			i += 1;
			while (i < text.length) {
				if (text[i] === '\\') {
					i += 2;
					continue;
				}
				if (text[i] === char) {
					terminated = true;
					i += 1;
					break;
				}
				// Quotes other than backticks don't span lines.
				if (text[i] === '\n' && char !== '`') break;
				i += 1;
			}
			// An unterminated quote (e.g. an apostrophe in a shell comment)
			// was not a string — rescan from the next character.
			if (!terminated && char !== '`') i = quote_start + 1;
			continue;
		}

		if (char === '/' && text[i + 1] === '/' && text[i - 1] !== ':') {
			push_normal(i);
			let end = text.indexOf('\n', i);
			if (end === -1) end = text.length;
			segments.push({ text: text.slice(i, end), comment: true });
			has_comment = true;
			normal_start = end;
			i = end;
			continue;
		}

		if (char === '/' && text[i + 1] === '*') {
			push_normal(i);
			const close = text.indexOf('*/', i + 2);
			const end = close === -1 ? text.length : close + 2;
			segments.push({ text: text.slice(i, end), comment: true });
			has_comment = true;
			normal_start = end;
			i = end;
			continue;
		}

		if (allow_hash_comments && char === '#' && (i === 0 || /\s/.test(text[i - 1]))) {
			push_normal(i);
			let end = text.indexOf('\n', i);
			if (end === -1) end = text.length;
			segments.push({ text: text.slice(i, end), comment: true });
			has_comment = true;
			normal_start = end;
			i = end;
			continue;
		}

		i += 1;
	}

	if (!has_comment) return null;
	push_normal(text.length);
	return segments;
}

/**
 * Heuristic: does this text read as source code?
 */
function looks_like_code(text: string): boolean {
	return (
		/(^|\n)\s*(\/\/|\/\*|import\s|export\s|const\s|let\s|function\s|class\s|interface\s)/.test(
			text
		) ||
		/[;{}]\s*(\n|$)/.test(text) ||
		// A whitespace-preceded `//` anywhere (a `:` before it, as in URLs,
		// does not count).
		/\s\/\//.test(text)
	);
}

/**
 * Heuristic: does this text read as a shell session or script?
 */
function looks_like_shell(text: string): boolean {
	return /(^|\n)\s*(\$ |#!|npm\s|npx\s|node\s|git\s|gh\s|fly\s|cd\s|cp\s|mv\s|rm\s|mkdir\s|echo\s|curl\s|docker\s|brew\s|sh\s|bash\s)/.test(
		text
	);
}
