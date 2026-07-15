/**
 * Order pending migrations by timestamp, with narrowly scoped `before`
 * constraints allowed to override that default order.
 *
 * @param {Array<{ id: string, before?: string[], up: (context: { db: any }) => unknown }>} migrations
 * @param {Set<string>} applied
 */
export function plan_pending_migrations(migrations, applied) {
	const by_id = new Map(migrations.map((migration) => [migration.id, migration]));

	for (const migration of migrations) {
		if (migration.before !== undefined && !Array.isArray(migration.before)) {
			throw new Error(`Migration "${migration.id}" before must be an array of migration ids.`);
		}
		if (new Set(migration.before ?? []).size !== (migration.before ?? []).length) {
			throw new Error(`Migration "${migration.id}" before contains duplicate migration ids.`);
		}
		for (const target_id of migration.before ?? []) {
			if (typeof target_id !== 'string' || !by_id.has(target_id)) {
				throw new Error(
					`Migration "${migration.id}" references missing before target "${target_id}".`
				);
			}
			if (target_id === migration.id) {
				throw new Error(`Migration "${migration.id}" cannot run before itself.`);
			}
		}
	}

	const pending = migrations.filter((migration) => !applied.has(migration.id));
	const pending_by_id = new Map(pending.map((migration) => [migration.id, migration]));
	const outgoing = new Map(pending.map((migration) => [migration.id, []]));
	const incoming_count = new Map(pending.map((migration) => [migration.id, 0]));

	for (const migration of pending) {
		for (const target_id of migration.before ?? []) {
			if (applied.has(target_id)) {
				throw new Error(
					`Migration "${migration.id}" cannot run before already-applied migration "${target_id}".`
				);
			}
			if (!pending_by_id.has(target_id)) continue;
			outgoing.get(migration.id).push(target_id);
			incoming_count.set(target_id, incoming_count.get(target_id) + 1);
		}
	}

	const ready = pending
		.filter((migration) => incoming_count.get(migration.id) === 0)
		.sort(compare_migrations);
	const ordered = [];

	while (ready.length > 0) {
		const migration = ready.shift();
		ordered.push(migration);

		for (const target_id of outgoing.get(migration.id)) {
			const remaining = incoming_count.get(target_id) - 1;
			incoming_count.set(target_id, remaining);
			if (remaining === 0) {
				ready.push(pending_by_id.get(target_id));
				ready.sort(compare_migrations);
			}
		}
	}

	if (ordered.length !== pending.length) {
		const cycle = pending
			.filter((migration) => incoming_count.get(migration.id) > 0)
			.map((migration) => migration.id)
			.sort();
		throw new Error(`Migration before constraints contain a cycle: ${cycle.join(', ')}.`);
	}

	return ordered;
}

function compare_migrations(left, right) {
	return left.id.localeCompare(right.id);
}
