import { describe, it, expect } from 'vitest';
import { validate_markdown_sources } from './config.js';

const VALID = { markdown: '# Manual', source: 'MANUAL.md', pathname: '/manual' };

describe('validate_markdown_sources', () => {
	it('accepts an empty mapping', () => {
		expect(validate_markdown_sources([])).toEqual([]);
	});

	it('normalizes a valid entry and defaults toc to false', () => {
		expect(validate_markdown_sources([VALID])).toEqual([
			{ markdown: '# Manual', source: 'MANUAL.md', pathname: '/manual', toc: false }
		]);
	});

	it('keeps toc when explicitly enabled', () => {
		expect(validate_markdown_sources([{ ...VALID, toc: true }])).toEqual([
			{ markdown: '# Manual', source: 'MANUAL.md', pathname: '/manual', toc: true }
		]);
	});

	it('rejects a non-array value', () => {
		expect(() => validate_markdown_sources({})).toThrow(/must be an array/);
	});

	it('rejects non-object entries', () => {
		expect(() => validate_markdown_sources(['MANUAL.md'])).toThrow(/must be an object/);
	});

	it('rejects unknown fields', () => {
		expect(() => validate_markdown_sources([{ ...VALID, draft: true }])).toThrow(
			/unknown field "draft"/
		);
	});

	it('rejects a non-boolean toc', () => {
		expect(() => validate_markdown_sources([{ ...VALID, toc: 'yes' }])).toThrow(
			/toc must be a boolean/
		);
	});

	it('rejects missing markdown content', () => {
		expect(() => validate_markdown_sources([{ source: 'MANUAL.md', pathname: '/manual' }])).toThrow(
			/\?raw import/
		);
	});

	it('rejects a missing or non-md source path', () => {
		expect(() => validate_markdown_sources([{ markdown: '# X', pathname: '/manual' }])).toThrow(
			/repo-relative \.md path/
		);
		expect(() => validate_markdown_sources([{ ...VALID, source: 'MANUAL.txt' }])).toThrow(
			/repo-relative \.md path/
		);
	});

	describe('pathname', () => {
		it('rejects relative pathnames', () => {
			expect(() => validate_markdown_sources([{ ...VALID, pathname: 'manual' }])).toThrow(
				/absolute URL path/
			);
		});

		it('rejects the home route', () => {
			expect(() => validate_markdown_sources([{ ...VALID, pathname: '/' }])).toThrow(/home route/);
		});

		it('rejects nested pathnames', () => {
			expect(() => validate_markdown_sources([{ ...VALID, pathname: '/docs/manual' }])).toThrow(
				/single lowercase URL segment/
			);
		});

		it('rejects trailing slashes', () => {
			expect(() => validate_markdown_sources([{ ...VALID, pathname: '/manual/' }])).toThrow(
				/single lowercase URL segment/
			);
		});

		it('rejects query strings and fragments', () => {
			expect(() => validate_markdown_sources([{ ...VALID, pathname: '/manual?x=1' }])).toThrow(
				/single lowercase URL segment/
			);
			expect(() => validate_markdown_sources([{ ...VALID, pathname: '/manual#top' }])).toThrow(
				/single lowercase URL segment/
			);
		});

		it('rejects dot segments and encoded separators', () => {
			expect(() => validate_markdown_sources([{ ...VALID, pathname: '/..' }])).toThrow(
				/single lowercase URL segment/
			);
			expect(() => validate_markdown_sources([{ ...VALID, pathname: '/docs%2Fmanual' }])).toThrow(
				/single lowercase URL segment/
			);
		});

		it('rejects duplicate pathnames', () => {
			expect(() => validate_markdown_sources([VALID, { ...VALID, source: 'OTHER.md' }])).toThrow(
				/duplicates pathname/
			);
		});
	});
});
