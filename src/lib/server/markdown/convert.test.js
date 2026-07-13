import { describe, it, expect } from 'vitest';
import { convert_markdown, MarkdownConversionError } from './convert.js';
import { compose_markdown_document } from './compose.js';

const MAPPING = { source: 'manual.md', pathname: '/manual' };

const SHARED_DOCUMENTS = {
	nav_document: { document_id: 'nav_1', nodes: { nav_1: { id: 'nav_1', type: 'nav' } } },
	footer_document: {
		document_id: 'footer_1',
		nodes: { footer_1: { id: 'footer_1', type: 'footer' } }
	}
};

/** @param {string} markdown */
function convert(markdown, mapping = MAPPING) {
	return convert_markdown(markdown, mapping);
}

/** @param {{ document_id: string, nodes: Record<string, any> }} doc */
function page_body_nodes(doc) {
	return doc.nodes[doc.document_id].body.nodes.map((id) => doc.nodes[id]);
}

/** @param {{ document_id: string, nodes: Record<string, any> }} doc */
function flat_text_nodes(doc) {
	return page_body_nodes(doc).flatMap((block) =>
		block.type === 'prose' ? block.body.nodes.map((id) => doc.nodes[id]) : [block]
	);
}

describe('convert_markdown', () => {
	it('produces a page whose composed document validates against the schema', () => {
		const doc = convert(
			'# Title\n\nIntro with **bold** and a [link](https://example.com).\n\n' +
				'## Chapter\n\n- one\n- two\n\n```js\nconsole.log(1);\n```\n\nOutro.'
		);
		expect(() => compose_markdown_document(doc, SHARED_DOCUMENTS)).not.toThrow();
	});

	it('wraps text blocks in prose and splits prose runs at code blocks', () => {
		const doc = convert('One.\n\n```\ncode\n```\n\nTwo.');
		const body = page_body_nodes(doc);
		expect(body.map((node) => node.type)).toEqual(['prose', 'preformatted', 'prose']);
		expect(body[1].content.content).toBe('code');
	});

	it('maps headings 1-5 and paragraphs', () => {
		const doc = convert('# A\n\n## B\n\n### C\n\n#### D\n\n##### E\n\nText.');
		expect(flat_text_nodes(doc).map((node) => node.type)).toEqual([
			'heading_1',
			'heading_2',
			'heading_3',
			'heading_4',
			'heading_5',
			'paragraph'
		]);
	});

	it('rejects heading level 6', () => {
		expect(() => convert('###### Deep')).toThrow(/Heading level 6/);
	});

	it('gives headings slugified ids and dedupes duplicates', () => {
		const doc = convert('## Getting started\n\n## Getting started\n\n## 2024 roadmap');
		const ids = flat_text_nodes(doc).map((node) => node.id);
		expect(ids).toEqual(['getting-started', 'getting-started-2', 'h-2024-roadmap']);
	});

	it('converts unordered lists to layout 1 and ordered lists to layout 3', () => {
		const doc = convert('- a\n- b\n\n1. one\n2. two');
		const lists = flat_text_nodes(doc).filter((node) => node.type === 'list');
		expect(lists.map((list) => list.layout)).toEqual([1, 3]);
		const first_item = doc.nodes[lists[0].list_items.nodes[0]];
		expect(first_item.type).toBe('list_item');
		expect(first_item.content.content).toBe('a');
	});

	it('rejects nested lists', () => {
		expect(() => convert('- a\n  - nested')).toThrow(/Nested lists/);
	});

	it('rejects multi-block list items', () => {
		expect(() => convert('- a\n\n  second paragraph')).toThrow(/single line of text/);
	});

	it('converts strong, emphasis, and inline code to mark nodes with ranges', () => {
		const doc = convert('plain **bold** and *soft* and `code`');
		const paragraph = flat_text_nodes(doc)[0];
		expect(paragraph.content.content).toBe('plain bold and soft and code');
		const marks = paragraph.content.marks.map((mark) => ({
			...mark,
			type: doc.nodes[mark.node_id].type
		}));
		expect(marks).toEqual([
			{ start_offset: 6, end_offset: 10, node_id: marks[0].node_id, type: 'strong' },
			{ start_offset: 15, end_offset: 19, node_id: marks[1].node_id, type: 'emphasis' },
			{ start_offset: 24, end_offset: 28, node_id: marks[2].node_id, type: 'code' }
		]);
	});

	it('counts mark offsets in grapheme clusters', () => {
		const doc = convert('👨‍👩‍👧‍👦 family **bold**');
		const paragraph = flat_text_nodes(doc)[0];
		const [mark] = paragraph.content.marks;
		// The family emoji is one grapheme: "👨‍👩‍👧‍👦 family " = 9 graphemes.
		expect(mark.start_offset).toBe(9);
		expect(mark.end_offset).toBe(13);
	});

	it('converts links into link mark nodes with href and target', () => {
		const doc = convert('See [the manual](/manual) now');
		const paragraph = flat_text_nodes(doc)[0];
		const [mark] = paragraph.content.marks;
		const link = doc.nodes[mark.node_id];
		expect(link).toMatchObject({ type: 'link', href: '/manual', target: '_self' });
		expect(paragraph.content.content.slice(mark.start_offset, mark.end_offset)).toBe('the manual');
	});

	it('rejects unsafe link protocols', () => {
		expect(() => convert('[x](javascript:alert(1))')).toThrow(/Unsafe link protocol/);
	});

	it('allows http, https, mailto, absolute, and fragment links', () => {
		expect(() =>
			convert(
				'[a](https://example.com) [b](http://example.com) [c](mailto:x@y.z) [d](/page) [e](#section)'
			)
		).not.toThrow();
	});

	it('rejects relative .md links with a hint', () => {
		expect(() => convert('[x](getting-started.md)')).toThrow(/configured pathname/);
	});

	it('rejects nested inline formatting', () => {
		expect(() => convert('**bold with [link](/x)**')).toThrow(/Nested inline formatting/);
		expect(() => convert('*emphasis with **strong***')).toThrow(/Nested inline formatting/);
	});

	it('turns soft line wraps into spaces', () => {
		const doc = convert('wrapped\nline');
		expect(flat_text_nodes(doc)[0].content.content).toBe('wrapped line');
	});

	it('keeps hard breaks as newlines in paragraphs', () => {
		const doc = convert('first\\\nsecond');
		expect(flat_text_nodes(doc)[0].content.content).toBe('first\nsecond');
	});

	it('rejects hard breaks in list items', () => {
		expect(() => convert('- first\\\nsecond')).toThrow(/Hard line breaks/);
	});

	it('rejects blockquotes, tables, raw HTML, and thematic breaks', () => {
		expect(() => convert('> quote')).toThrow(/Unsupported markdown block/);
		expect(() => convert('<div>raw</div>')).toThrow(/Unsupported markdown block/);
		expect(() => convert('text\n\n---\n\nmore')).toThrow(/Thematic breaks/);
	});

	it('hints about frontmatter for a leading thematic break', () => {
		expect(() => convert('---\ntitle: X\n---\n\nBody')).toThrow(/frontmatter is not supported/);
	});

	it('rejects images with a source-located error', () => {
		try {
			convert('An image:\n\n![alt](image.png)');
			expect.unreachable('should have thrown');
		} catch (error) {
			expect(error).toBeInstanceOf(MarkdownConversionError);
			expect(error.message).toMatch(/^manual\.md:3:1/);
			expect(error.message).toMatch(/asset ids/);
		}
	});

	it('is deterministic for unchanged input', () => {
		const markdown = '# Title\n\n## A\n\nText **bold**.\n\n## B\n\n- item';
		expect(convert(markdown)).toEqual(convert(markdown));
	});

	describe('table of contents', () => {
		const TOC_MAPPING = { ...MAPPING, toc: true };
		const MANUAL = '# Manual\n\nIntro prose.\n\n## Install\n\nText.\n\n## Usage\n\nMore text.';

		it('inserts a linked list before the first chapter heading', () => {
			const doc = convert(MANUAL, TOC_MAPPING);
			const nodes = flat_text_nodes(doc);
			const types = nodes.map((node) => node.type);
			expect(types).toEqual([
				'heading_1',
				'paragraph',
				'list',
				'heading_2',
				'paragraph',
				'heading_2',
				'paragraph'
			]);
			const toc = nodes[2];
			const items = toc.list_items.nodes.map((id) => doc.nodes[id]);
			expect(items.map((item) => item.content.content)).toEqual(['Install', 'Usage']);
			const hrefs = items.map((item) => doc.nodes[item.content.marks[0].node_id].href);
			expect(hrefs).toEqual(['#install', '#usage']);
		});

		it('produces a valid composed document', () => {
			const doc = convert(MANUAL, TOC_MAPPING);
			expect(() => compose_markdown_document(doc, SHARED_DOCUMENTS)).not.toThrow();
		});

		it('omits the toc with fewer than two chapter headings', () => {
			const doc = convert('# Title\n\n## Only chapter\n\nText.', TOC_MAPPING);
			expect(flat_text_nodes(doc).some((node) => node.type === 'list')).toBe(false);
		});

		it('omits the toc when there are no headings below the first depth', () => {
			const doc = convert('# One\n\nText.\n\n# Two\n\nText.', TOC_MAPPING);
			expect(flat_text_nodes(doc).some((node) => node.type === 'list')).toBe(false);
		});

		it('uses the shallowest depth below the first heading', () => {
			const doc = convert('# T\n\n### Deep A\n\nx\n\n## Chapter A\n\nx\n\n## Chapter B', {
				...MAPPING,
				toc: true
			});
			const toc = flat_text_nodes(doc).find((node) => node.type === 'list');
			const items = toc.list_items.nodes.map((id) => doc.nodes[id].content.content);
			expect(items).toEqual(['Chapter A', 'Chapter B']);
		});
	});
});

describe('compose_markdown_document', () => {
	it('merges shared nodes and sets nav/footer references', () => {
		const doc = compose_markdown_document(convert('# Hi'), SHARED_DOCUMENTS);
		const page = doc.nodes[doc.document_id];
		expect(page.nav).toBe('nav_1');
		expect(page.footer).toBe('footer_1');
		expect(doc.nodes.nav_1.type).toBe('nav');
		expect(doc.nodes.footer_1.type).toBe('footer');
	});

	it('rejects node id collisions with shared documents', () => {
		const page_doc = convert('# Hi');
		const shared = structuredClone(SHARED_DOCUMENTS);
		shared.nav_document.nodes[page_doc.document_id] = {
			id: page_doc.document_id,
			type: 'nav_link'
		};
		expect(() => compose_markdown_document(page_doc, shared)).toThrow(/collides/);
	});

	it('fails without shared documents', () => {
		expect(() => compose_markdown_document(convert('# Hi'), /** @type {any} */ ({}))).toThrow(
			/nav document/
		);
	});
});
