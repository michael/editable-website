<script>
	import App from './components/App.svelte';

	/** @type {{ data: { has_backend?: boolean, is_admin?: boolean, origin?: string | null, document: any, slug: string | null, is_new?: boolean } }} */
	const props = $props();
</script>

<!--
	BUG: When navigating from / with preloading on the Svedit component ends up
	with a stale session, breaking editing.
	See https://github.com/michael/editable-website/issues/40
-->
<!-- {#key initial_doc.document_id} -->
<App {...props.data} />
<!-- {/key} -->
