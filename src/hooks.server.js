// import migrate from './sqlite/migrate.js';

/** @type {import('@sveltejs/kit').ServerInit} */
export async function init() {
	// migrate();
}

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
	event.locals.user = 'Admin';

	// TODO: Implement user authentication and authorization logic here.
	// event.locals.user = await getUserInformation(event.cookies.get('sessionid'));
	const response = await resolve(event);
	return response;
};
