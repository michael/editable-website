import crypto from 'node:crypto';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const admin_session_cookie_name = 'ew_admin_session';
export const session_duration_seconds = 14 * 24 * 60 * 60;

// Login throttle: the first `free_attempts` failures are free, then each
// failure locks login for `base_lockout_seconds`, doubling per failure up to
// `max_lockout_seconds`. Global (there is only one admin), persisted in
// site_settings so restarts don't reset it.
const LOGIN_THROTTLE = {
	free_attempts: 5,
	base_lockout_seconds: 30,
	max_lockout_seconds: 3600
};

const LOGIN_THROTTLE_KEY = 'login_throttle';

/**
 * Constant-time password comparison over SHA-256 digests.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function passwords_match(a, b) {
	const digest = (/** @type {string} */ s) => crypto.createHash('sha256').update(s).digest();
	return crypto.timingSafeEqual(digest(a), digest(b));
}

/**
 * @param {import('node:sqlite').DatabaseSync} db
 * @returns {{ failed_count: number, locked_until: number }}
 */
function get_login_throttle_state(db) {
	const row = /** @type {{ value: string } | undefined} */ (
		db.prepare('SELECT value FROM site_settings WHERE key = ?').get(LOGIN_THROTTLE_KEY)
	);

	return row ? JSON.parse(row.value) : { failed_count: 0, locked_until: 0 };
}

/**
 * @param {import('node:sqlite').DatabaseSync} db
 * @param {{ failed_count: number, locked_until: number }} state
 */
function set_login_throttle_state(db, state) {
	db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)').run(
		LOGIN_THROTTLE_KEY,
		JSON.stringify(state)
	);
}

/**
 * Seconds until login attempts are accepted again (0 when unlocked).
 *
 * @param {import('node:sqlite').DatabaseSync} db
 * @returns {number}
 */
export function get_login_lockout_seconds(db) {
	const { locked_until } = get_login_throttle_state(db);
	return Math.max(locked_until - Math.floor(Date.now() / 1000), 0);
}

/**
 * @param {import('node:sqlite').DatabaseSync} db
 */
export function register_failed_login(db) {
	const state = get_login_throttle_state(db);
	state.failed_count += 1;

	const throttled_failures = state.failed_count - LOGIN_THROTTLE.free_attempts;
	if (throttled_failures >= 0) {
		const lockout_seconds = Math.min(
			LOGIN_THROTTLE.base_lockout_seconds * 2 ** throttled_failures,
			LOGIN_THROTTLE.max_lockout_seconds
		);
		state.locked_until = Math.floor(Date.now() / 1000) + lockout_seconds;
	}

	set_login_throttle_state(db, state);
}

/**
 * @param {import('node:sqlite').DatabaseSync} db
 */
export function reset_login_throttle(db) {
	set_login_throttle_state(db, { failed_count: 0, locked_until: 0 });
}

/**
 * @returns {string}
 */
export function get_required_admin_password() {
	const admin_password = env.ADMIN_PASSWORD;
	if (!admin_password) {
		throw new Error('ADMIN_PASSWORD must be set');
	}

	return admin_password;
}

/**
 * @returns {number}
 */
export function get_session_expires_at() {
	return Math.floor(Date.now() / 1000) + session_duration_seconds;
}

/**
 * @param {import('@sveltejs/kit').Cookies} cookies
 */
export function clear_admin_session_cookie(cookies) {
	cookies.set(admin_session_cookie_name, '', {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: env.NODE_ENV === 'production',
		maxAge: 0
	});
}

/**
 * @param {import('@sveltejs/kit').Cookies} cookies
 * @param {string} session_id
 */
export function set_admin_session_cookie(cookies, session_id) {
	cookies.set(admin_session_cookie_name, session_id, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: env.NODE_ENV === 'production',
		maxAge: session_duration_seconds
	});
}

/**
 * @param {string} session_id
 */
export async function delete_session(session_id) {
	const { default: db } = await import('$lib/server/db.js');
	db.prepare('DELETE FROM sessions WHERE session_id = ?').run(session_id);
}

/**
 * @param {{ is_admin?: boolean }} locals
 */
export function require_admin_session(locals) {
	if (!locals.is_admin) {
		error(401, 'Unauthorized');
	}
}