import { describe, it, expect } from 'vitest';
import { validate_markdown_sources } from './config.js';

describe('validate_markdown_sources', () => {
	it('accepts an empty mapping', () => {
		expect(validate_markdown_sources([])).toEqual([]);
	});

	it('normalizes a valid entry and defaults toc to false', () => {
		expect(validate_markdown_sources([{ source: 'manual.md', pathname: '/manual' }])).toEqual([
			{ source: 'manual.md', pathname: '/manual', toc: false }
		]);
	});

	it('keeps toc when explicitly enabled', () => {
		expect(
			validate_markdown_sources([{ source: 'docs/manual.md', pathname: '/manual', toc: true }])
		).toEqual([{ source: 'docs/manual.md', pathname: '/manual', toc: true }]);
	});

	it('rejects a non-array value', () => {
		expect(() => validate_markdown_sources({})).toThrow(/must be an array/);
	});

	it('rejects non-object entries', () => {
		expect(() => validate_markdown_sources(['manual.md'])).toThrow(/must be an object/);
	});

	it('rejects unknown fields', () => {
		expect(() =>
			validate_markdown_sources([{ source: 'manual.md', pathname: '/manual', draft: true }])
		).toThrow(/unknown field "draft"/);
	});

	it('rejects a non-boolean toc', () => {
		expect(() =>
			validate_markdown_sources([{ source: 'manual.md', pathname: '/manual', toc: 'yes' }])
		).toThrow(/toc must be a boolean/);
	});

	describe('source', () => {
		it('rejects absolute paths', () => {
			expect(() =>
				validate_markdown_sources([{ source: '/manual.md', pathname: '/manual' }])
			).toThrow(/relative to the content\/ directory/);
		});

		it('rejects backslashes', () => {
			expect(() =>
				validate_markdown_sources([{ source: 'docs\\manual.md', pathname: '/manual' }])
			).toThrow(/forward slashes/);
		});

		it('rejects parent directory segments', () => {
			expect(() =>
				validate_markdown_sources([{ source: '../manual.md', pathname: '/manual' }])
			).toThrow(/invalid path segment/);
		});

		it('rejects dot segments', () => {
			expect(() =>
				validate_markdown_sources([{ source: './manual.md', pathname: '/manual' }])
			).toThrow(/invalid path segment/);
		});

		it('rejects empty segments', () => {
			expect(() =>
				validate_markdown_sources([{ source: 'docs//manual.md', pathname: '/manual' }])
			).toThrow(/invalid path segment/);
		});

		it('rejects non-md files', () => {
			expect(() =>
				validate_markdown_sources([{ source: 'manual.txt', pathname: '/manual' }])
			).toThrow(/\.md file/);
		});

		it('rejects duplicate sources', () => {
			expect(() =>
				validate_markdown_sources([
					{ source: 'manual.md', pathname: '/manual' },
					{ source: 'manual.md', pathname: '/handbook' }
				])
			).toThrow(/duplicates source/);
		});
	});

	describe('pathname', () => {
		it('rejects relative pathnames', () => {
			expect(() =>
				validate_markdown_sources([{ source: 'manual.md', pathname: 'manual' }])
			).toThrow(/absolute URL path/);
		});

		it('rejects the home route', () => {
			expect(() => validate_markdown_sources([{ source: 'manual.md', pathname: '/' }])).toThrow(
				/home route/
			);
		});

		it('rejects nested pathnames', () => {
			expect(() =>
				validate_markdown_sources([{ source: 'manual.md', pathname: '/docs/manual' }])
			).toThrow(/single lowercase URL segment/);
		});

		it('rejects trailing slashes', () => {
			expect(() =>
				validate_markdown_sources([{ source: 'manual.md', pathname: '/manual/' }])
			).toThrow(/single lowercase URL segment/);
		});

		it('rejects query strings and fragments', () => {
			expect(() =>
				validate_markdown_sources([{ source: 'manual.md', pathname: '/manual?x=1' }])
			).toThrow(/single lowercase URL segment/);
			expect(() =>
				validate_markdown_sources([{ source: 'manual.md', pathname: '/manual#top' }])
			).toThrow(/single lowercase URL segment/);
		});

		it('rejects dot segments and encoded separators', () => {
			expect(() => validate_markdown_sources([{ source: 'manual.md', pathname: '/..' }])).toThrow(
				/single lowercase URL segment/
			);
			expect(() =>
				validate_markdown_sources([{ source: 'manual.md', pathname: '/docs%2Fmanual' }])
			).toThrow(/single lowercase URL segment/);
		});

		it('rejects duplicate pathnames', () => {
			expect(() =>
				validate_markdown_sources([
					{ source: 'manual.md', pathname: '/manual' },
					{ source: 'handbook.md', pathname: '/manual' }
				])
			).toThrow(/duplicates pathname/);
		});
	});
});
