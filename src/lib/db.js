import { DatabaseSync } from 'node:sqlite';
import { env as private_env } from "$env/dynamic/private";

const DB_PATH = private_env.DB_PATH;

const db = new DatabaseSync(DB_PATH, {
	// enableForeignKeyConstraints: true
});

export default db;
