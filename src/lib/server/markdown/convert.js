// Markdown to Editable document conversion.
//
// Converts a markdown file into a page document graph matching
// `document_schema`. The result contains the `page` root plus all content
// nodes, but no nav/footer — those are merged in by `compose.js`.
//
// Unsupported constructs are rejected with a source-located error instead of
// being silently dropped or degraded.

import { fromMarkdown } from 'mdast-util-from-markdown';
import slugify from 'slugify';
import { get_char_length } from 'svedit';
import { MEDIA_DEFAULTS } from '$lib/config.js';
import { document_schema } from '$lib/document_schema.js';
import { select_toc_headings } from './toc.js';

const SAFE_LINK_SCHEMES = new Set(['http', 'https', 'mailto']);

/**
 * Whether the schema allows newlines in a node type's content property.
 *
 * @param {string} node_type
 * @returns {boolean}
 */
function content_allows_newlines(node_type) {
	return document_schema[node_type]?.properties?.content?.allow_newlines === true;
}

export class MarkdownConversionError extends Error {
	/**
	 * @param {string} message
	 * @param {{ source?: string, position?: any }} [options]
	 */
	constructor(message, { source, position } = {}) {
		const location = position?.start
			? `${source ?? 'markdown'}:${position.start.line}:${position.start.column}`
			: (source ?? 'markdown');
		super(`${location} — ${message}`);
		this.name = 'MarkdownConversionError';
		this.source = source;
		this.position = position ?? null;
	}
}

/**
 * Convert markdown text to a page document graph (without nav/footer).
 *
 * @param {string} markdown_text
 * @param {{ source: string, pathname: string, toc?: boolean }} mapping
 * @returns {{ document_id: string, nodes: Record<string, any> }}
 * @throws {MarkdownConversionError}
 */
export function convert_markdown(markdown_text, mapping) {
	const { source, pathname, toc = false } = mapping;
	const tree = fromMarkdown(markdown_text);

	const ctx = {
		source,
		doc_id: `md_${pathname.slice(1).replaceAll('-', '_')}`,
		counter: 0,
		/** @type {Record<string, any>} */
		nodes: {},
		/** @type {Set<string>} */
		used_ids: new Set()
	};

	/** @type {string[]} */
	const body_ids = [];
	/** @type {string[] | null} */
	let prose_items = null;
	/** @type {{ id: string, depth: number, container: string[] }[]} */
	const headings = [];
	// Body indexes where a level-2 heading starts a new section.
	/** @type {number[]} */
	const section_boundaries = [];
	/** @type {Map<string[], string>} prose body array -> prose node id */
	const prose_ids_by_container = new Map();

	function flush_prose() {
		if (!prose_items || prose_items.length === 0) {
			prose_items = null;
			return;
		}
		const prose_id = next_id(ctx);
		ctx.nodes[prose_id] = {
			id: prose_id,
			type: 'prose',
			// Layout 1: left-oriented column (Prose.svelte).
			layout: 1,
			body: { nodes: prose_items, marks: [], annotations: [] }
		};
		prose_ids_by_container.set(prose_items, prose_id);
		body_ids.push(prose_id);
		prose_items = null;
	}

	/** @param {string} node_id */
	function push_prose_item(node_id) {
		if (!prose_items) prose_items = [];
		prose_items.push(node_id);
	}

	for (const [index, block] of tree.children.entries()) {
		switch (block.type) {
			case 'paragraph': {
				const id = next_id(ctx);
				ctx.nodes[id] = {
					id,
					type: 'paragraph',
					layout: 1,
					content: convert_inline(ctx, block.children, {
						allow_newlines: content_allows_newlines('paragraph')
					})
				};
				push_prose_item(id);
				break;
			}
			case 'heading': {
				if (block.depth > 5) {
					throw new MarkdownConversionError(
						'Heading level 6 is not supported (the schema defines heading_1 through heading_5).',
						{ source, position: block.position }
					);
				}
				const id = heading_id(ctx, block);
				ctx.nodes[id] = {
					id,
					type: `heading_${block.depth}`,
					layout: 1,
					content: convert_inline(ctx, block.children, {
						allow_newlines: content_allows_newlines(`heading_${block.depth}`)
					})
				};
				// Level-2 headings start a new visual section: close the current
				// prose run and remember where the section begins in the body.
				if (block.depth === 2) {
					flush_prose();
					section_boundaries.push(body_ids.length);
				}
				push_prose_item(id);
				if (!prose_items) throw new Error('unreachable');
				headings.push({ id, depth: block.depth, container: prose_items });
				break;
			}
			case 'list': {
				push_prose_item(convert_list(ctx, block));
				break;
			}
			case 'code': {
				flush_prose();
				const id = next_id(ctx);
				ctx.nodes[id] = {
					id,
					type: 'preformatted',
					content: { content: block.value ?? '', marks: [], annotations: [] }
				};
				body_ids.push(id);
				break;
			}
			case 'thematicBreak': {
				const hint =
					index === 0 && block.position?.start?.line === 1
						? ' If this is YAML frontmatter, note that frontmatter is not supported.'
						: '';
				throw new MarkdownConversionError(`Thematic breaks (---) are not supported.${hint}`, {
					source,
					position: block.position
				});
			}
			default:
				throw new MarkdownConversionError(
					`Unsupported markdown block "${block.type}". Supported blocks: paragraphs, headings (1-5), lists, code blocks.`,
					{ source, position: block.position }
				);
		}
	}
	flush_prose();

	if (toc) {
		insert_toc(ctx, headings, { body_ids, prose_ids_by_container, section_boundaries });
	}

	// Wrap each section's body range (its prose plus interleaved code blocks,
	// up to the next section) in a section mark, so it renders as one visual
	// group. Content before the first level-2 heading stays unwrapped.
	/** @type {{ start_offset: number, end_offset: number, node_id: string }[]} */
	const body_marks = [];
	for (const [boundary_index, start] of section_boundaries.entries()) {
		const end = section_boundaries[boundary_index + 1] ?? body_ids.length;
		if (end <= start) continue;
		const section_id = next_id(ctx);
		ctx.nodes[section_id] = { id: section_id, type: 'section' };
		body_marks.push({ start_offset: start, end_offset: end, node_id: section_id });
	}

	const image_id = next_id(ctx);
	ctx.nodes[image_id] = { id: image_id, type: 'image', ...MEDIA_DEFAULTS };

	ctx.nodes[ctx.doc_id] = {
		id: ctx.doc_id,
		type: 'page',
		title: { content: '', marks: [], annotations: [] },
		description: { content: '', marks: [], annotations: [] },
		image: image_id,
		body: { nodes: body_ids, marks: body_marks, annotations: [] }
	};

	return { document_id: ctx.doc_id, nodes: ctx.nodes };
}

/**
 * @param {any} ctx
 * @returns {string}
 */
function next_id(ctx) {
	let id;
	do {
		ctx.counter += 1;
		id = `${ctx.doc_id}_${ctx.counter}`;
	} while (ctx.used_ids.has(id));
	ctx.used_ids.add(id);
	return id;
}

/**
 * Derive a stable, human-readable id for a heading so it can be targeted with
 * `#fragment` links (svedit's Node component renders `id={node.id}` in the DOM).
 *
 * @param {any} ctx
 * @param {any} block - mdast heading node
 * @returns {string}
 */
function heading_id(ctx, block) {
	const text = collect_plain_text(block.children);
	let slug = slugify(text, { lower: true, strict: true });
	if (slug === '') slug = 'heading';
	// Node ids must start with a letter or underscore.
	if (!/^[a-z_]/.test(slug)) slug = `h-${slug}`;

	let id = slug;
	let suffix = 2;
	while (ctx.used_ids.has(id)) {
		id = `${slug}-${suffix}`;
		suffix += 1;
	}
	ctx.used_ids.add(id);
	return id;
}

/**
 * @param {any[]} children - mdast inline nodes
 * @returns {string}
 */
function collect_plain_text(children) {
	let text = '';
	for (const child of children) {
		if (typeof child.value === 'string') text += child.value;
		else if (Array.isArray(child.children)) text += collect_plain_text(child.children);
	}
	return text;
}

/**
 * @param {any} ctx
 * @param {any} block - mdast list node
 * @returns {string} the list node id
 */
function convert_list(ctx, block) {
	/** @type {string[]} */
	const item_ids = [];

	for (const item of block.children) {
		const blocks = item.children ?? [];
		const nested_list = blocks.find((child) => child.type === 'list');
		if (nested_list) {
			throw new MarkdownConversionError(
				'Nested lists are not supported (list items are single lines).',
				{ source: ctx.source, position: nested_list.position }
			);
		}
		if (blocks.length > 1 || (blocks.length === 1 && blocks[0].type !== 'paragraph')) {
			throw new MarkdownConversionError(
				'List items must contain a single paragraph (no multiple blocks).',
				{ source: ctx.source, position: item.position }
			);
		}

		const id = next_id(ctx);
		ctx.nodes[id] = {
			id,
			type: 'list_item',
			content:
				blocks.length === 0
					? { content: '', marks: [], annotations: [] }
					: convert_inline(ctx, blocks[0].children, {
							allow_newlines: content_allows_newlines('list_item')
						})
		};
		item_ids.push(id);
	}

	const list_id = next_id(ctx);
	ctx.nodes[list_id] = {
		id: list_id,
		type: 'list',
		// Layouts per ListItem.svelte: 1 = dash bullets, 3 = numbered.
		layout: block.ordered === true ? 3 : 1,
		list_items: { nodes: item_ids, marks: [], annotations: [] }
	};
	return list_id;
}

/**
 * Flatten mdast inline nodes into an annotated text value, minting mark nodes
 * into the document graph.
 *
 * Svedit stores marks as separate nodes referenced by
 * `{ start_offset, end_offset, node_id }` ranges, with offsets counted in
 * grapheme clusters, and requires ranges to be mutually exclusive — nested
 * inline formatting cannot be represented and is rejected.
 *
 * @param {any} ctx
 * @param {any[]} children - mdast inline nodes
 * @param {{ allow_newlines: boolean }} options
 * @returns {{ content: string, marks: any[], annotations: any[] }}
 */
function convert_inline(ctx, children, { allow_newlines }) {
	let content = '';
	/** @type {{ start: number, end: number, type: string, data?: Record<string, any> }[]} */
	const utf16_ranges = [];

	/**
	 * @param {any[]} inline_nodes
	 * @param {boolean} inside_mark
	 */
	function walk(inline_nodes, inside_mark) {
		for (const inline of inline_nodes) {
			switch (inline.type) {
				case 'text':
					// Soft line wraps in the source render as spaces (CommonMark
					// semantics); TextProperty would render "\n" as a real break.
					content += inline.value.replaceAll('\n', ' ');
					break;
				case 'break':
					if (!allow_newlines) {
						throw new MarkdownConversionError('Hard line breaks are not allowed here.', {
							source: ctx.source,
							position: inline.position
						});
					}
					content += '\n';
					break;
				case 'inlineCode': {
					assert_not_nested(ctx, inline, inside_mark);
					const start = content.length;
					// Per CommonMark, line endings in code spans become spaces.
					content += inline.value.replaceAll('\n', ' ');
					add_range(start, content.length, 'code');
					break;
				}
				case 'strong':
				case 'emphasis': {
					assert_not_nested(ctx, inline, inside_mark);
					const start = content.length;
					walk(inline.children, true);
					add_range(start, content.length, inline.type);
					break;
				}
				case 'link': {
					assert_not_nested(ctx, inline, inside_mark);
					const href = validate_href(ctx, inline);
					const start = content.length;
					walk(inline.children, true);
					add_range(start, content.length, 'link', { href, target: '_self' });
					break;
				}
				case 'html':
					throw new MarkdownConversionError('Inline HTML is not supported.', {
						source: ctx.source,
						position: inline.position
					});
				case 'image':
					throw new MarkdownConversionError(
						'Images are not supported yet (the media model requires Editable asset ids).',
						{ source: ctx.source, position: inline.position }
					);
				default:
					throw new MarkdownConversionError(
						`Unsupported inline markdown construct "${inline.type}".`,
						{ source: ctx.source, position: inline.position }
					);
			}
		}
	}

	/**
	 * @param {number} start
	 * @param {number} end
	 * @param {string} type
	 * @param {Record<string, any>} [data]
	 */
	function add_range(start, end, type, data) {
		if (start === end) return;
		utf16_ranges.push({ start, end, type, data });
	}

	walk(children, false);

	const marks = to_grapheme_marks(ctx, content, utf16_ranges);
	return { content, marks, annotations: [] };
}

/**
 * @param {any} ctx
 * @param {any} inline
 * @param {boolean} inside_mark
 */
function assert_not_nested(ctx, inline, inside_mark) {
	if (inside_mark) {
		throw new MarkdownConversionError(
			'Nested inline formatting (e.g. bold inside a link) is not supported — marks are mutually exclusive in the content model.',
			{ source: ctx.source, position: inline.position }
		);
	}
}

/**
 * @param {any} ctx
 * @param {any} inline - mdast link node
 * @returns {string}
 */
function validate_href(ctx, inline) {
	const href = inline.url ?? '';
	const scheme_match = href.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);

	if (scheme_match) {
		if (!SAFE_LINK_SCHEMES.has(scheme_match[1].toLowerCase())) {
			throw new MarkdownConversionError(`Unsafe link protocol "${scheme_match[1]}:".`, {
				source: ctx.source,
				position: inline.position
			});
		}
	} else if (/\.md($|[#?])/i.test(href)) {
		throw new MarkdownConversionError(
			`Links to .md files are not supported — link to the configured pathname instead (e.g. "/manual"): "${href}".`,
			{ source: ctx.source, position: inline.position }
		);
	}

	return href;
}

/**
 * Convert UTF-16 code-unit ranges to grapheme-cluster mark ranges and mint the
 * mark nodes (svedit counts text offsets in grapheme clusters).
 *
 * @param {any} ctx
 * @param {string} content
 * @param {{ start: number, end: number, type: string, data?: Record<string, any> }[]} utf16_ranges
 * @returns {{ start_offset: number, end_offset: number, node_id: string }[]}
 */
function to_grapheme_marks(ctx, content, utf16_ranges) {
	if (utf16_ranges.length === 0) return [];

	const segmenter = new Intl.Segmenter();
	/** @type {Map<number, number>} grapheme index at each UTF-16 boundary */
	const boundaries = new Map([[0, 0]]);
	let grapheme_index = 0;
	for (const segment of segmenter.segment(content)) {
		grapheme_index += 1;
		boundaries.set(segment.index + segment.segment.length, grapheme_index);
	}

	return utf16_ranges.map((range) => {
		const start_offset = boundaries.get(range.start);
		const end_offset = boundaries.get(range.end);
		if (start_offset === undefined || end_offset === undefined) {
			throw new MarkdownConversionError(
				'Inline formatting boundary falls inside a multi-character glyph.',
				{ source: ctx.source }
			);
		}
		const node_id = next_id(ctx);
		ctx.nodes[node_id] = { id: node_id, type: range.type, ...range.data };
		return { start_offset, end_offset, node_id };
	});
}

/**
 * Insert a generated table of contents in front of the first chapter heading.
 *
 * When that heading starts a section (the level-2 case), the list becomes its
 * own prose node placed between the intro and the first section, so it does
 * not render as part of the first chapter. Otherwise it is inserted inline,
 * directly before the heading.
 *
 * @param {any} ctx
 * @param {{ id: string, depth: number, container: string[] }[]} headings
 * @param {{ body_ids: string[], prose_ids_by_container: Map<string[], string>, section_boundaries: number[] }} body
 */
function insert_toc(ctx, headings, { body_ids, prose_ids_by_container, section_boundaries }) {
	const selection = select_toc_headings(headings);
	if (!selection) return;

	/** @type {string[]} */
	const item_ids = [];
	for (const heading of selection.targets) {
		const heading_node = ctx.nodes[heading.id];
		const label = heading_node.content.content;
		const link_id = next_id(ctx);
		ctx.nodes[link_id] = { id: link_id, type: 'link', href: `#${heading.id}`, target: '_self' };
		const item_id = next_id(ctx);
		ctx.nodes[item_id] = {
			id: item_id,
			type: 'list_item',
			content: {
				content: label,
				marks: [{ start_offset: 0, end_offset: get_char_length(label), node_id: link_id }],
				annotations: []
			}
		};
		item_ids.push(item_id);
	}

	const list_id = next_id(ctx);
	ctx.nodes[list_id] = {
		id: list_id,
		type: 'list',
		layout: 1,
		list_items: { nodes: item_ids, marks: [], annotations: [] }
	};

	const { container, id } = selection.insert_before;

	if (container[0] === id) {
		// The heading opens its prose container, so the toc gets its own prose
		// node in front of it; section ranges after the insertion shift by one.
		const toc_prose_id = next_id(ctx);
		ctx.nodes[toc_prose_id] = {
			id: toc_prose_id,
			type: 'prose',
			layout: 1,
			body: { nodes: [list_id], marks: [], annotations: [] }
		};
		const body_index = body_ids.indexOf(prose_ids_by_container.get(container) ?? '');
		body_ids.splice(body_index, 0, toc_prose_id);
		for (const [index, boundary] of section_boundaries.entries()) {
			if (boundary >= body_index) section_boundaries[index] = boundary + 1;
		}
	} else {
		container.splice(container.indexOf(id), 0, list_id);
	}
}
