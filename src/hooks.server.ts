import { VERCEL } from '$app/env/private';
import type { Handle, ServerInit } from '@sveltejs/kit';
import {
	admin_session_cookie_name,
	clear_admin_session_cookie,
	get_session_expires_at,
	session_duration_seconds,
	session_renewal_interval_seconds,
	set_admin_session_cookie
} from '#lib/server/auth.js';

export const init: ServerInit = async () => {
	if (!VERCEL) {
		const { default: migrate } = await import('#lib/server/migrate.js');
		migrate();
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.is_admin = false;

	if (!VERCEL) {
		const session_id = event.cookies.get(admin_session_cookie_name);

		if (session_id) {
			const { default: db } = await import('#lib/server/db.js');
			const row = db
				.prepare('SELECT expires FROM sessions WHERE session_id = ?')
				.get(session_id) as unknown as { expires: number } | undefined;

			const now = Math.floor(Date.now() / 1000);

			if (!row) {
				clear_admin_session_cookie(event.cookies);
			} else if (row.expires <= now) {
				db.prepare('DELETE FROM sessions WHERE session_id = ?').run(session_id);
				clear_admin_session_cookie(event.cookies);
			} else {
				// Sliding renewal, at most once per renewal interval
				const last_renewed_at = row.expires - session_duration_seconds;
				if (now - last_renewed_at >= session_renewal_interval_seconds) {
					db.prepare('UPDATE sessions SET expires = ? WHERE session_id = ?').run(
						get_session_expires_at(),
						session_id
					);
					set_admin_session_cookie(event.cookies, session_id);
				}
				event.locals.is_admin = true;
			}
		}
	}

	const response = await resolve(event);
	return response;
};
