import { describe, it, expect } from 'vitest';
import { build_registry, get_markdown_page } from './registry.js';

describe('build_registry', () => {
	it('builds an empty registry from an empty mapping', () => {
		expect(build_registry([]).size).toBe(0);
	});

	it('indexes configured pages by pathname', () => {
		const registry = build_registry([
			{ markdown: '# Manual', source: 'MANUAL.md', pathname: '/manual', toc: true },
			{ markdown: '# Guide', source: 'content/guide.md', pathname: '/guide' }
		]);
		expect(registry.get('/manual')).toEqual({
			markdown: '# Manual',
			source: 'MANUAL.md',
			pathname: '/manual',
			toc: true
		});
		expect(registry.get('/guide')?.markdown).toBe('# Guide');
	});

	it('propagates configuration errors', () => {
		expect(() =>
			build_registry([{ markdown: '# X', source: 'MANUAL.md', pathname: 'manual' }])
		).toThrow(/absolute URL path/);
	});
});

describe('get_markdown_page', () => {
	it('returns null for unmapped pathnames', () => {
		expect(get_markdown_page('/not-mapped-anywhere')).toBe(null);
	});

	it('resolves the configured kitchen-sink demo page', () => {
		const page = get_markdown_page('/kitchen-sink');
		expect(page?.source).toBe('content/kitchen-sink.md');
		expect(page?.toc).toBe(true);
		expect(page?.markdown).toContain('# Field guide');
	});
});
