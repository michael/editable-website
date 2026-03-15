import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

export const DATA_DIR = process.env.DATA_DIR || 'data';
export const DB_PATH = join(DATA_DIR, 'db.sqlite3');
export const ASSET_PATH = join(DATA_DIR, 'assets');

// Ensure the data directory exists
mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.exec('PRAGMA journal_mode=WAL');

export default db;