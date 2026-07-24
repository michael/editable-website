import { defineEnvVars } from '@sveltejs/kit/env';
import { building } from '$app/env';

// Variables are validated twice: once while the app is built, and again when it
// starts. Deploys build without secrets — the Dockerfile runs `pnpm build` long
// before the server's .env exists — so required variables are only enforced at
// startup, never during the build.
function required(hint: string) {
	return {
		'~standard': {
			version: 1 as const,
			vendor: 'editable',
			types: undefined as unknown as { input: string | undefined; output: string },
			validate: (value: unknown) => {
				if (!building && !value) {
					return { issues: [{ message: `Value is missing. ${hint}` }] };
				}

				return { value: (value ?? '') as string };
			}
		}
	};
}

// Variables that may legitimately be absent need a validator saying so,
// otherwise SvelteKit treats them as required non-empty strings.
function optional<T>(parse: (value: string | undefined) => T) {
	return {
		'~standard': {
			version: 1 as const,
			vendor: 'editable',
			// Type-only carrier that SvelteKit reads to infer the exported type.
			// Standard Schema never touches it at runtime.
			types: undefined as unknown as { input: string | undefined; output: T },
			validate: (value: unknown) => ({ value: parse(value as string | undefined) })
		}
	};
}

const where =
	'Set it in .env locally, via `fly secrets set` on Fly, or in the server .env on a VPS.';

export const variables = defineEnvVars({
	ADMIN_PASSWORD: {
		description: 'Password for the admin login. The app refuses to start without it.',
		schema: required(where)
	},
	ORIGIN: {
		description:
			'Public origin of the deployment, e.g. https://my-site.example.com. Must match the URL used in the browser exactly, or write requests fail with 403.',
		schema: required(where)
	},
	VERCEL: {
		description:
			'Set by Vercel. Its absence is what puts the app in backend mode, so it must stay optional.',
		schema: optional((value) => value)
	},
	NODE_ENV: {
		description: 'Used to decide whether session cookies are marked secure.',
		schema: optional((value) => value)
	}
});
