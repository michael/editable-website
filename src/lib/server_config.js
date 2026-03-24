import { join } from 'node:path';

export const DATA_DIR = process.env.DATA_DIR || 'data';
export const DB_PATH = join(DATA_DIR, 'db.sqlite3');
export const ASSET_PATH = join(DATA_DIR, 'assets');
