// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// SvelteKit's App types rely on declaration merging, so this must stay
		// an interface.
		// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
		interface Locals {
			db: import('node:sqlite').DatabaseSync;
			user: string;
			is_admin: boolean;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
