const SUPPORTED_LANGUAGES = new Set(['javascript', 'bash']);
const TOKEN_KIND_BY_COLOR = new Map();
const ACTIVE_RANGES_BY_CODEBLOCK = new Map();
const TOKEN_KIND_NAMES = [
	'keyword',
	'string',
	'comment',
	'number',
	'function',
	'type',
	'variable',
	'operator',
	'punctuation',
	'constant',
	'property'
];

const SYNTAX_HIGHLIGHT_STYLES = `
::highlight(svedit-syntax-keyword) {
	color: oklch(50% 0.22 285);
}

::highlight(svedit-syntax-string) {
	color: oklch(48% 0.15 145);
}

::highlight(svedit-syntax-comment) {
	color: color-mix(in oklch, currentColor 45%, transparent);
	font-style: italic;
}

::highlight(svedit-syntax-number) {
	color: oklch(52% 0.18 35);
}

::highlight(svedit-syntax-function) {
	color: oklch(48% 0.16 255);
}

::highlight(svedit-syntax-type) {
	color: oklch(46% 0.15 205);
}

::highlight(svedit-syntax-variable) {
	color: oklch(34% 0.04 260);
}

::highlight(svedit-syntax-operator) {
	color: oklch(45% 0.16 285);
}

::highlight(svedit-syntax-punctuation) {
	color: oklch(34% 0.04 260);
}

::highlight(svedit-syntax-constant) {
	color: oklch(50% 0.17 25);
}

::highlight(svedit-syntax-property) {
	color: oklch(42% 0.13 230);
}
`;

let did_inject_syntax_highlight_styles = false;
let highlighter_promise = null;
let highlighter_failed = false;
let token_kind_index = 0;

function normalize_language(language) {
	if (language === 'js') return 'javascript';
	if (language === 'shell' || language === 'sh') return 'bash';
	if (SUPPORTED_LANGUAGES.has(language)) return language;
	return 'javascript';
}

function inject_syntax_highlight_styles() {
	if (did_inject_syntax_highlight_styles) return;
	if (typeof document === 'undefined') return;
	if (document.getElementById('svedit-syntax-highlight-styles')) {
		did_inject_syntax_highlight_styles = true;
		return;
	}

	const style = document.createElement('style');
	style.id = 'svedit-syntax-highlight-styles';
	style.textContent = SYNTAX_HIGHLIGHT_STYLES;
	document.head.appendChild(style);
	did_inject_syntax_highlight_styles = true;
}

function get_css_highlight_support() {
	if (typeof CSS === 'undefined') return null;
	if (!CSS.highlights) return null;
	if (typeof Highlight === 'undefined') return null;
	if (typeof Range === 'undefined') return null;
	inject_syntax_highlight_styles();
	return CSS.highlights;
}

async function get_highlighter() {
	if (highlighter_failed) return null;

	if (!highlighter_promise) {
		highlighter_promise = Promise.all([
			import('shiki/core'),
			import('shiki/engine/oniguruma'),
			import('shiki/wasm'),
			import('@shikijs/langs/javascript'),
			import('@shikijs/langs/bash'),
			import('@shikijs/themes/github-light')
		])
			.then(([{ createHighlighterCore }, { createOnigurumaEngine }, wasm, javascript, bash, github_light]) =>
				createHighlighterCore({
					engine: createOnigurumaEngine(wasm.default),
					langs: [javascript.default, bash.default],
					themes: [github_light.default]
				})
			)
			.catch((error) => {
				console.warn('Syntax highlighting unavailable:', error);
				highlighter_failed = true;
				highlighter_promise = null;
				return null;
			});
	}

	return highlighter_promise;
}

function get_token_kind(token) {
	if (token.explanation?.length) {
		const scopes = token.explanation
			.flatMap((explanation) => explanation.scopes ?? [])
			.map((scope) => scope.scopeName ?? scope.name ?? '')
			.join(' ');

		if (/\bcomment\b/.test(scopes)) return 'comment';
		if (/\bstring\b/.test(scopes)) return 'string';
		if (/\bconstant\.numeric\b|\bnumber\b/.test(scopes)) return 'number';
		if (/\bkeyword\b|\bstorage\b/.test(scopes)) return 'keyword';
		if (/\bentity\.name\.function\b|\bsupport\.function\b/.test(scopes)) return 'function';
		if (/\bentity\.name\.type\b|\bsupport\.type\b|\bsupport\.class\b/.test(scopes)) return 'type';
		if (/\bvariable\b/.test(scopes)) return 'variable';
		if (/\bkeyword\.operator\b/.test(scopes)) return 'operator';
		if (/\bpunctuation\b/.test(scopes)) return 'punctuation';
		if (/\bconstant\b/.test(scopes)) return 'constant';
		if (/\bproperty\b/.test(scopes)) return 'property';
	}

	if (!token.color) return 'variable';

	if (!TOKEN_KIND_BY_COLOR.has(token.color)) {
		const kind = TOKEN_KIND_NAMES[token_kind_index % TOKEN_KIND_NAMES.length];
		TOKEN_KIND_BY_COLOR.set(token.color, kind);
		token_kind_index += 1;
	}

	return TOKEN_KIND_BY_COLOR.get(token.color);
}

function get_codeblock_text(line_nodes) {
	return line_nodes.map((line_node) => line_node?.content?.text ?? '').join('\n');
}

function escape_selector_value(value) {
	if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
		return CSS.escape(value);
	}

	return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function get_line_text_element(codeblock_element, line_id) {
	return codeblock_element.querySelector(`[data-node-id="${escape_selector_value(line_id)}"] [data-type="text"]`);
}

function get_text_node(element) {
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

	while (walker.nextNode()) {
		const text_node = walker.currentNode;
		if (text_node.nodeValue !== '') return text_node;
	}

	return null;
}

function build_line_index(line_nodes, codeblock_element) {
	const line_index = [];
	let start_offset = 0;

	for (const line_node of line_nodes) {
		const text = line_node?.content?.text ?? '';
		const text_element = get_line_text_element(codeblock_element, line_node.id);
		const text_node = text_element ? get_text_node(text_element) : null;

		line_index.push({
			id: line_node.id,
			start_offset,
			end_offset: start_offset + text.length,
			text,
			text_node
		});

		start_offset += text.length + 1;
	}

	return line_index;
}

function get_line_for_offset(line_index, offset) {
	return line_index.find((line) => offset >= line.start_offset && offset <= line.end_offset) ?? null;
}

function create_range_for_line_slice(line, start_offset, end_offset) {
	if (!line.text_node) return null;
	if (start_offset >= end_offset) return null;

	const range = new Range();
	range.setStart(line.text_node, Math.max(0, start_offset - line.start_offset));
	range.setEnd(line.text_node, Math.min(line.text.length, end_offset - line.start_offset));
	return range;
}

function create_ranges_for_token(line_index, start_offset, end_offset) {
	const ranges = [];
	let current_offset = start_offset;

	while (current_offset < end_offset) {
		const line = get_line_for_offset(line_index, current_offset);
		if (!line) break;

		const slice_end_offset = Math.min(end_offset, line.end_offset);
		const range = create_range_for_line_slice(line, current_offset, slice_end_offset);

		if (range) {
			ranges.push(range);
		}

		current_offset = slice_end_offset;

		if (current_offset < end_offset) {
			current_offset += 1;
		}
	}

	return ranges;
}

function get_highlight_name(kind) {
	return `svedit-syntax-${kind}`;
}

function update_shared_highlights() {
	const highlights = get_css_highlight_support();
	if (!highlights) return;

	for (const kind of TOKEN_KIND_NAMES) {
		const ranges = [];

		for (const ranges_by_kind of ACTIVE_RANGES_BY_CODEBLOCK.values()) {
			ranges.push(...(ranges_by_kind.get(kind) ?? []));
		}

		highlights.delete(get_highlight_name(kind));

		if (ranges.length > 0) {
			highlights.set(get_highlight_name(kind), new Highlight(...ranges));
		}
	}
}

function clear_codeblock_ranges(codeblock_id) {
	ACTIVE_RANGES_BY_CODEBLOCK.delete(codeblock_id);
	update_shared_highlights();
}

function set_codeblock_ranges(codeblock_id, ranges_by_kind) {
	ACTIVE_RANGES_BY_CODEBLOCK.set(codeblock_id, ranges_by_kind);
	update_shared_highlights();
}

function flatten_tokens(token_lines) {
	const tokens = [];

	for (const line_tokens of token_lines) {
		for (const token of line_tokens) {
			tokens.push(token);
		}
	}

	return tokens;
}

export async function highlight_codeblock({
	codeblock_id,
	codeblock_element,
	line_nodes,
	language = 'javascript'
}) {
	const highlights = get_css_highlight_support();

	if (!codeblock_id) {
		return () => {};
	}

	if (!highlights || !codeblock_element || !line_nodes?.length) {
		clear_codeblock_ranges(codeblock_id);
		return () => clear_codeblock_ranges(codeblock_id);
	}

	const code = get_codeblock_text(line_nodes);
	const normalized_language = normalize_language(language);
	const line_index = build_line_index(line_nodes, codeblock_element);
	const highlighter = await get_highlighter();
	if (!highlighter) {
		clear_codeblock_ranges(codeblock_id);
		return () => clear_codeblock_ranges(codeblock_id);
	}

	let token_result;
	try {
		token_result = highlighter.codeToTokens(code, {
			lang: normalized_language,
			theme: 'github-light',
			includeExplanation: true
		});
	} catch (error) {
		console.warn('Syntax highlighting failed:', error);
		clear_codeblock_ranges(codeblock_id);
		return () => clear_codeblock_ranges(codeblock_id);
	}

	const ranges_by_kind = new Map();
	const tokens = flatten_tokens(token_result.tokens);

	for (const token of tokens) {
		const kind = get_token_kind(token);
		const ranges = create_ranges_for_token(
			line_index,
			token.offset,
			token.offset + token.content.length
		);

		if (!ranges.length) continue;

		const kind_ranges = ranges_by_kind.get(kind) ?? [];
		kind_ranges.push(...ranges);
		ranges_by_kind.set(kind, kind_ranges);
	}

	set_codeblock_ranges(codeblock_id, ranges_by_kind);

	return () => clear_codeblock_ranges(codeblock_id);
}

export function syntax_highlighting(codeblock_element, options) {
	let current_options = options;
	let cleanup = () => {};
	let refresh_id = 0;

	async function refresh() {
		const current_refresh_id = refresh_id + 1;
		refresh_id = current_refresh_id;

		cleanup();
		cleanup = () => {};

		let next_cleanup;
		try {
			next_cleanup = await highlight_codeblock({
				...(current_options ?? {}),
				codeblock_element
			});
		} catch (error) {
			console.warn('Syntax highlighting failed:', error);

			if (current_options?.codeblock_id) {
				clear_codeblock_highlights(current_options.codeblock_id);
			}

			return;
		}

		if (current_refresh_id !== refresh_id) {
			next_cleanup();
			return;
		}

		cleanup = next_cleanup;
	}

	refresh();

	return {
		update(next_options) {
			current_options = next_options;
			refresh();
		},
		destroy() {
			refresh_id += 1;
			cleanup();

			if (current_options?.codeblock_id) {
				clear_codeblock_highlights(current_options.codeblock_id);
			}
		}
	};
}

export function get_codeblock_highlight_class() {
	return TOKEN_KIND_NAMES.map((kind) => `::highlight(${get_highlight_name(kind)})`).join(', ');
}

export function clear_codeblock_highlights(codeblock_id) {
	clear_codeblock_ranges(codeblock_id);
}

export { TOKEN_KIND_NAMES };