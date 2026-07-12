// Minimal S3 client for the automated backup layer (PLAN_AUTOMATED_BACKUP.md).
// Standalone: plain Node, no $lib imports — used by the server (asset
// mirroring) and by the boot/restore scripts. The whole layer is enabled by
// the presence of BUCKET_NAME; without it every export is a no-op or error.

import { readFile } from 'node:fs/promises';
import { AwsClient } from 'aws4fetch';

export function s3_enabled() {
	return Boolean(process.env.BUCKET_NAME);
}

// The automatic backup triggers (asset mirror, daily snapshot) run only in
// the deployed runtime — marked by the production entrypoint (run-cloud-boot
// via start-app.js), which dev servers and local previews never pass through.
// Local processes must never write to the bucket, even with credentials in
// .env; reads (pull-cloud, restore-assets) stay available everywhere.
export function backup_enabled() {
	return s3_enabled() && process.env.EDITABLE_DEPLOYED === '1';
}

/** @type {AwsClient | undefined} */
let client;

function aws() {
	if (!client) {
		client = new AwsClient({
			accessKeyId: /** @type {string} */ (process.env.AWS_ACCESS_KEY_ID),
			secretAccessKey: /** @type {string} */ (process.env.AWS_SECRET_ACCESS_KEY),
			region: process.env.AWS_REGION || 'auto',
			service: 's3'
		});
	}
	return client;
}

// Path-style URLs (endpoint/bucket/key) work across Tigris, R2, MinIO and AWS.
function bucket_url(suffix = '') {
	const endpoint = (
		process.env.AWS_ENDPOINT_URL_S3 || `https://s3.${process.env.AWS_REGION}.amazonaws.com`
	).replace(/\/+$/, '');
	return `${endpoint}/${process.env.BUCKET_NAME}/${suffix}`;
}

/**
 * Upload a buffer to the bucket.
 *
 * @param {string} key
 * @param {Buffer | Uint8Array} body
 */
export async function put_object(key, body) {
	// Buffer is a Uint8Array at runtime; TS's BodyInit just doesn't name it.
	const res = await aws().fetch(bucket_url(key), {
		method: 'PUT',
		body: /** @type {BodyInit} */ (/** @type {unknown} */ (body))
	});
	if (!res.ok) throw new Error(`S3 PUT ${key}: ${res.status} ${await res.text()}`);
}

/**
 * Upload a file from disk to the bucket.
 *
 * @param {string} key
 * @param {string} file_path
 */
export async function put_file(key, file_path) {
	await put_object(key, await readFile(file_path));
}

/**
 * Download an object as a buffer.
 *
 * @param {string} key
 * @returns {Promise<Buffer>}
 */
export async function get_object(key) {
	const res = await aws().fetch(bucket_url(key));
	if (!res.ok) throw new Error(`S3 GET ${key}: ${res.status}`);
	return Buffer.from(await res.arrayBuffer());
}

/**
 * List all object keys under a prefix (paginated).
 *
 * @param {string} prefix
 * @returns {Promise<string[]>}
 */
export async function list_keys(prefix) {
	const keys = [];
	let token;
	do {
		const params = new URLSearchParams({ 'list-type': '2', prefix, 'max-keys': '1000' });
		if (token) params.set('continuation-token', token);
		const res = await aws().fetch(bucket_url(`?${params}`));
		if (!res.ok) throw new Error(`S3 LIST ${prefix}: ${res.status} ${await res.text()}`);
		const xml = await res.text();
		for (const m of xml.matchAll(/<Key>([^<]+)<\/Key>/g)) keys.push(decode_xml(m[1]));
		token = (xml.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/) || [])[1];
	} while (token);
	return keys;
}

// Asset keys are hex hashes and "w<width>.webp" — this covers the general case anyway.
function decode_xml(s) {
	return s
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
		.replaceAll('&quot;', '"')
		.replaceAll('&#39;', "'")
		.replaceAll('&amp;', '&');
}

/**
 * Fire-and-forget mirror of a file to the bucket, used by the upload path.
 * Never throws and never blocks — a bucket hiccup must not fail the user's
 * upload; the boot sweep repairs any miss.
 *
 * @param {string} key
 * @param {string} file_path
 */
export function mirror_file(key, file_path) {
	if (!backup_enabled()) return;
	put_file(key, file_path).catch((err) => {
		console.error(`[backup] Asset mirror failed for ${key} (boot sweep will retry):`, err.message);
	});
}
