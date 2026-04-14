import { env } from '$env/dynamic/private';
import {
	admin_session_cookie_name,
	clear_admin_session_cookie,
	get_session_expires_at,
	set_admin_session_cookie
} from '$lib/server/auth.js';

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
				set_admin_session_cookie(event.cookies, session_id);
				event.locals.is_admin = true;
			}
		}
	}

	const response = await resolve(event);
	return response;
};