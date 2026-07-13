// Guards the demo page: content/kitchen-sink.md must convert, compose, and
// validate against the schema, so it keeps proving every supported construct.

import { describe, it, expect } from 'vitest';
import kitchen_sink from '../../../../content/kitchen-sink.md?raw';
import { convert_markdown } from './convert.js';
import { compose_markdown_document } from './compose.js';

const MAPPING = { source: 'kitchen-sink.md', pathname: '/kitchen-sink', toc: true };

const SHARED_DOCUMENTS = {
	nav_document: { document_id: 'nav_1', nodes: { nav_1: { id: 'nav_1', type: 'nav' } } },
	footer_document: {
		document_id: 'footer_1',
		nodes: { footer_1: { id: 'footer_1', type: 'footer' } }
	}
};

describe('kitchen-sink.md', () => {
	it('converts and validates against the schema', () => {
		const page_doc = convert_markdown(kitchen_sink, MAPPING);
		expect(() => compose_markdown_document(page_doc, SHARED_DOCUMENTS)).not.toThrow();
	});

	it('exercises every supported node and mark type', () => {
		const doc = convert_markdown(kitchen_sink, MAPPING);
		const nodes = Object.values(doc.nodes);
		const types = new Set(nodes.map((node) => node.type));

		for (const type of [
			'page',
			'prose',
			'preformatted',
			'paragraph',
			'heading_1',
			'heading_2',
			'heading_3',
			'heading_4',
			'heading_5',
			'list',
			'list_item',
			'strong',
			'emphasis',
			'code',
			'link'
		]) {
			expect(types, `missing node type ${type}`).toContain(type);
		}

		const list_layouts = new Set(
			nodes.filter((node) => node.type === 'list').map((node) => node.layout)
		);
		expect(list_layouts).toContain(1); // unordered (and the generated toc)
		expect(list_layouts).toContain(3); // ordered

		const hrefs = nodes.filter((node) => node.type === 'link').map((node) => node.href);
		expect(hrefs.some((href) => href.startsWith('https:'))).toBe(true);
		expect(hrefs.some((href) => href.startsWith('http:'))).toBe(true);
		expect(hrefs.some((href) => href.startsWith('mailto:'))).toBe(true);
		expect(hrefs.some((href) => href.startsWith('/'))).toBe(true);
		expect(hrefs.some((href) => href.startsWith('#'))).toBe(true);
	});

	it('wraps every chapter in a section mark', () => {
		const doc = convert_markdown(kitchen_sink, MAPPING);
		const body = doc.nodes[doc.document_id].body;
		// One section per ## chapter.
		expect(body.marks).toHaveLength(6);
		for (const mark of body.marks) {
			expect(doc.nodes[mark.node_id].type).toBe('section');
		}
		// Sections tile the body after intro and toc without gaps or overlap.
		const ranges = body.marks.map((mark) => [mark.start_offset, mark.end_offset]);
		for (const [index, [start, end]] of ranges.entries()) {
			expect(end).toBeGreaterThan(start);
			if (index > 0) expect(start).toBe(ranges[index - 1][1]);
		}
		expect(ranges.at(-1)?.[1]).toBe(body.nodes.length);
	});

	it('generates a table of contents linking every chapter', () => {
		const doc = convert_markdown(kitchen_sink, MAPPING);
		const toc_hrefs = Object.values(doc.nodes)
			.filter((node) => node.type === 'link' && node.href.startsWith('#'))
			.map((node) => node.href);

		for (const anchor of [
			'#getting-started',
			'#arranging-objects',
			'#the-command-line',
			'#troubleshooting',
			'#h-2038-and-beyond',
			'#colophon'
		]) {
			expect(toc_hrefs).toContain(anchor);
		}
	});
});
