import { describe, it, expect } from 'vitest';
import { split_code_comments } from './code_comments.js';

function comments(segments: { text: string; comment: boolean }[] | null) {
	return (segments ?? []).filter((segment) => segment.comment).map((segment) => segment.text);
}

function joined(segments: { text: string; comment: boolean }[] | null) {
	return (segments ?? []).map((segment) => segment.text).join('');
}

describe('split_code_comments', () => {
	it('splits out line comments', () => {
		const code = 'const x = 1; // the answer\nreturn x;';
		const segments = split_code_comments(code);
		expect(comments(segments)).toEqual(['// the answer']);
		expect(joined(segments)).toBe(code);
	});

	it('splits out block and doc comments', () => {
		const code = '/* setup */\nlet a = 1;\n/**\n * Docs.\n */\nfunction f() {}';
		const segments = split_code_comments(code);
		expect(comments(segments)).toEqual(['/* setup */', '/**\n * Docs.\n */']);
		expect(joined(segments)).toBe(code);
	});

	it('does not treat URLs as comments', () => {
		const code = 'const url = x; // see https://example.com\nfetch(url);';
		const segments = split_code_comments(code);
		expect(comments(segments)).toEqual(['// see https://example.com']);
	});

	it('ignores comment markers inside strings', () => {
		const code = "const url = 'https://example.com//path'; // real comment";
		const segments = split_code_comments(code);
		expect(comments(segments)).toEqual(['// real comment']);
	});

	it('handles unterminated block comments', () => {
		const code = 'let a = 1;\n/* trailing';
		expect(comments(split_code_comments(code))).toEqual(['/* trailing']);
	});

	it('returns null for code without comments', () => {
		expect(split_code_comments('const x = 1;\nreturn x;')).toBe(null);
	});

	it('returns null for prose and config text', () => {
		expect(split_code_comments('Just a sentence about http://example.com things.')).toBe(null);
		expect(split_code_comments('# ~/.config/aurora/config.ini\nbrightness = 7')).toBe(null);
	});

	it('does not let an apostrophe swallow the rest of the block', () => {
		const code = "echo don't panic; // still found\nnext();";
		expect(comments(split_code_comments(code))).toEqual(['// still found']);
	});

	it('recognizes mid-line comments without other code signals', () => {
		const code = 'strong, emphasis, code, highlight   // no properties\nsection   // groups blocks';
		expect(comments(split_code_comments(code))).toEqual(['// no properties', '// groups blocks']);
	});

	it('dims # comments in shell-ish blocks', () => {
		const code =
			'npm run data:pull-cloud                # latest bucket state\nnpm run dev # inspect "the" state';
		const segments = split_code_comments(code);
		expect(comments(segments)).toEqual(['# latest bucket state', '# inspect "the" state']);
		expect(joined(segments)).toBe(code);
	});

	it('handles quoted arguments before shell comments', () => {
		const code = 'npm run data:pull-cloud -- --at "2026-07-10T15:00:00Z" # a specific moment';
		expect(comments(split_code_comments(code))).toEqual(['# a specific moment']);
	});

	it('does not treat # as a comment outside shell blocks', () => {
		expect(split_code_comments('.accent { color: #fff; }')).toBe(null);
		expect(split_code_comments('# Heading\n\nProse follows.')).toBe(null);
	});
});
