import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type DatabaseConfig = {
	data_dir: string;
	db_path: string;
};

export type DatabaseConnection = {
	db: DatabaseSync;
	with_transaction: <T>(fn: () => T) => T;
};

export function create_database({ data_dir, db_path }: DatabaseConfig): DatabaseConnection {
	mkdirSync(data_dir, { recursive: true });
	mkdirSync(dirname(db_path), { recursive: true });

	const db = new DatabaseSync(db_path);
	db.exec('PRAGMA journal_mode=WAL');

	function with_transaction<T>(fn: () => T): T {
		db.exec('BEGIN IMMEDIATE');
		try {
			const result = fn();
			db.exec('COMMIT');
			return result;
		} catch (err) {
			db.exec('ROLLBACK');
			throw err;
		}
	}

	return { db, with_transaction };
}
