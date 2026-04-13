import { env } from '$env/dynamic/private';

const admin_session_cookie_name = 'ew_admin_session';
const session_duration_seconds = 14 * 24 * 60 * 60;

/**
 * @returns {number}
 */
function get_session_expires_at() {
	return Math.floor(Date.now() / 1000) + session_duration_seconds;
}

/**
 * @param {import('@sveltejs/kit').Cookies} cookies
 */
function clear_admin_session_cookie(cookies) {
	cookies.set(admin_session_cookie_name, '', {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: env.NODE_ENV === 'production',
		maxAge: 0
	});
}

/** @type {import('@sveltejs/kit').ServerInit} */
export async function init() {
	if (!env.VERCEL && !env.ADMIN_PASSWORD) {
		throw new Error('ADMIN_PASSWORD must be set');
	}

	if (!env.VERCEL) {
		const { default: migrate } = await import('$lib/server/migrate.js');
		migrate();
	}
}

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
	event.locals.is_admin = false;
	event.locals.admin_session_id = null;

	if (!env.VERCEL) {
		const session_id = event.cookies.get(admin_session_cookie_name);

		if (session_id) {
			const { default: db } = await import('$lib/server/db.js');
			const row = /** @type {{ expires: number } | undefined } */ (
				db.prepare('SELECT expires FROM sessions WHERE session_id = ?').get(session_id)
			);

			if (!row) {
				clear_admin_session_cookie(event.cookies);
			} else if (row.expires <= Math.floor(Date.now() / 1000)) {
				db.prepare('DELETE FROM sessions WHERE session_id = ?').run(session_id);
				clear_admin_session_cookie(event.cookies);
			} else {
				db.prepare('UPDATE sessions SET expires = ? WHERE session_id = ?').run(
					get_session_expires_at(),
					session_id
				);
				event.cookies.set(admin_session_cookie_name, session_id, {
					path: '/',
					httpOnly: true,
					sameSite: 'lax',
					secure: env.NODE_ENV === 'production',
					maxAge: session_duration_seconds
				});
				event.locals.is_admin = true;
				event.locals.admin_session_id = session_id;
			}
		}
	}

	const response = await resolve(event);
	return response;
};