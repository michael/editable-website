import { describe, it, expect } from 'vitest';
import { build_registry, get_markdown_page } from './registry.js';

const FILES = {
	'/content/manual.md': '# Manual',
	'/content/docs/guide.md': '# Guide'
};

describe('build_registry', () => {
	it('builds an empty registry from an empty mapping', () => {
		expect(build_registry([], FILES).size).toBe(0);
	});

	it('does not require any files for an empty mapping', () => {
		expect(build_registry([], {}).size).toBe(0);
	});

	it('indexes configured pages by pathname', () => {
		const registry = build_registry(
			[
				{ source: 'manual.md', pathname: '/manual', toc: true },
				{ source: 'docs/guide.md', pathname: '/guide' }
			],
			FILES
		);
		expect(registry.get('/manual')).toEqual({
			source: 'manual.md',
			pathname: '/manual',
			toc: true,
			markdown: '# Manual'
		});
		expect(registry.get('/guide')?.markdown).toBe('# Guide');
	});

	it('rejects a mapping without a matching file', () => {
		expect(() => build_registry([{ source: 'missing.md', pathname: '/missing' }], FILES)).toThrow(
			/no matching file at content\/missing\.md/
		);
	});

	it('propagates configuration errors', () => {
		expect(() => build_registry([{ source: 'manual.md', pathname: 'manual' }], FILES)).toThrow(
			/absolute URL path/
		);
	});
});

describe('get_markdown_page', () => {
	it('returns null for unmapped pathnames with the default empty configuration', () => {
		expect(get_markdown_page('/anything')).toBe(null);
	});
});
