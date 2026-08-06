import { getContext } from 'svelte';
import type { SveditContext as BaseSveditContext } from 'svedit';
import type { document_schema } from '#app/document_schema.js';

/**
 * The svedit context as provided by Svedit.svelte, with the session typed
 * against this app's document schema.
 */
export type SveditContext = BaseSveditContext<typeof document_schema>;

/**
 * Typed accessor for the svedit context. Use inside components rendered
 * under a Svedit instance instead of `getContext('svedit')` — the returned
 * session is schema-typed, so values returned from `session.get(path)` can be
 * annotated with the app's `Nodes` map.
 */
export function get_svedit_context(): SveditContext {
	return getContext('svedit') as SveditContext;
}
