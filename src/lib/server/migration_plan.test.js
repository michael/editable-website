import { describe, expect, it } from 'vitest';
import { plan_pending_migrations } from './migration_plan.js';

const migration = (id, before) => ({ id, before, up() {} });

describe('plan_pending_migrations', () => {
	it('uses timestamp ids as the default order', () => {
		const migrations = [
			migration('20260102T000000000Z_custom_b'),
			migration('20260101T000000000Z_editable_a')
		];
		expect(plan_pending_migrations(migrations, new Set()).map(({ id }) => id)).toEqual([
			'20260101T000000000Z_editable_a',
			'20260102T000000000Z_custom_b'
		]);
	});

	it('allows a later migration to run before a pending earlier migration', () => {
		const upstream = migration('20260101T000000000Z_editable_rename_title');
		const bridge = migration('20260102T000000000Z_custom_prepare_title', [upstream.id]);
		expect(plan_pending_migrations([upstream, bridge], new Set()).map(({ id }) => id)).toEqual([
			bridge.id,
			upstream.id
		]);
	});

	it('rejects missing targets, cycles, and already-applied targets', () => {
		expect(() => plan_pending_migrations([migration('a', ['missing'])], new Set())).toThrow(
			/missing before target/
		);

		const a = migration('a', ['b']);
		const b = migration('b', ['a']);
		expect(() => plan_pending_migrations([a, b], new Set())).toThrow(/contain a cycle/);

		expect(() => plan_pending_migrations([a, b], new Set(['b']))).toThrow(/already-applied/);
	});

	it('rejects duplicate before targets', () => {
		const target = migration('a');
		const source = migration('b', ['a', 'a']);
		expect(() => plan_pending_migrations([target, source], new Set())).toThrow(
			/contains duplicate/
		);
	});
});
