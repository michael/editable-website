// Home route load function
// In static/Vercel mode the page component falls back to the demo document.
// In full runtime mode it loads the configured home page from the backend.

/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
	const parent_data = await parent();

	if (!parent_data.has_backend) {
		return {
			document: null
		};
	}

	const { get_home_document } = await import('$lib/api.remote.js');

	return {
		document: await get_home_document()
	};
}