import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { mkdir, unlink, rm, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable, Transform } from 'node:stream';
import { mkdirSync } from 'node:fs';
import { ASSET_PATH } from '$lib/server_config.js';

// Ensure the asset directory exists on module load
mkdirSync(ASSET_PATH, { recursive: true });

/**
 * Get the full filesystem path for an original asset.
 *
 * @param {string} asset_id - e.g. "c4b519da...fabdb.webp"
 * @returns {string}
 */
export function asset_path(asset_id) {
	return join(ASSET_PATH, asset_id);
}

/**
 * Get the stem (asset id without extension) for building variant paths.
 *
 * @param {string} asset_id
 * @returns {string}
 */
function stem(asset_id) {
	const ext = extname(asset_id);
	return ext ? asset_id.slice(0, -ext.length) : asset_id;
}

/**
 * Get the directory path for an asset's variants.
 *
 * @param {string} asset_id
 * @returns {string}
 */
export function variant_dir(asset_id) {
	return join(ASSET_PATH, stem(asset_id));
}

/**
 * Get the full filesystem path for a width variant.
 *
 * @param {string} asset_id
 * @param {number} width
 * @returns {string}
 */
export function variant_path(asset_id, width) {
	return join(variant_dir(asset_id), `w${width}.webp`);
}

/**
 * Stream a ReadableStream (web), Buffer, or Uint8Array to a file on disk.
 * Returns the number of bytes written.
 *
 * @param {string} file_path
 * @param {ReadableStream | Buffer | Uint8Array} data
 * @returns {Promise<number>}
 */
async function stream_to_file(file_path, data) {
	/** @type {import('node:stream').Readable} */
	let source;

	if (Buffer.isBuffer(data) || data instanceof Uint8Array) {
		source = Readable.from([data]);
	} else {
		source = Readable.fromWeb(/** @type {import('node:stream/web').ReadableStream} */ (data));
	}

	let bytes_written = 0;

	const counter = new Transform({
		transform(chunk, _encoding, callback) {
			bytes_written += chunk.length;
			callback(null, chunk);
		}
	});

	const dest = createWriteStream(file_path);
	await pipeline(source, counter, dest);

	return bytes_written;
}

/**
 * Write an original asset to disk, streaming.
 *
 * @param {string} asset_id
 * @param {ReadableStream | Buffer | Uint8Array} data
 * @returns {Promise<number>} bytes written
 */
export async function write_asset(asset_id, data) {
	return stream_to_file(asset_path(asset_id), data);
}

/**
 * Write a width variant to disk, streaming.
 * Creates the variant directory if needed.
 *
 * @param {string} asset_id
 * @param {number} width
 * @param {ReadableStream | Buffer | Uint8Array} data
 * @returns {Promise<number>} bytes written
 */
export async function write_variant(asset_id, width, data) {
	const dir = variant_dir(asset_id);
	await mkdir(dir, { recursive: true });
	return stream_to_file(variant_path(asset_id, width), data);
}

/**
 * Check if an original asset exists on disk.
 *
 * @param {string} asset_id
 * @returns {boolean}
 */
export function asset_exists(asset_id) {
	return existsSync(asset_path(asset_id));
}

/**
 * Delete an asset and all its variants from disk.
 *
 * @param {string} asset_id
 * @returns {Promise<void>}
 */
export async function delete_asset(asset_id) {
	// Delete the original file
	try {
		await unlink(asset_path(asset_id));
	} catch {
		// File may not exist
	}

	// Delete the variant directory
	const dir = variant_dir(asset_id);
	if (existsSync(dir)) {
		await rm(dir, { recursive: true });
	}
}

/**
 * Create a Node.js ReadStream for an original asset.
 *
 * @param {string} asset_id
 * @returns {import('node:fs').ReadStream}
 */
export function create_asset_read_stream(asset_id) {
	return createReadStream(asset_path(asset_id));
}

/**
 * Create a Node.js ReadStream for a width variant.
 *
 * @param {string} asset_id
 * @param {number} width
 * @returns {import('node:fs').ReadStream}
 */
export function create_variant_read_stream(asset_id, width) {
	return createReadStream(variant_path(asset_id, width));
}

/**
 * Get the size of an original asset in bytes.
 *
 * @param {string} asset_id
 * @returns {Promise<number>}
 */
export async function asset_size(asset_id) {
	const s = await stat(asset_path(asset_id));
	return s.size;
}