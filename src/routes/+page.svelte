<script>
	import App from './components/App.svelte';

	/** @type {{ data: { has_backend?: boolean, is_admin?: boolean, document: any, slug: string | null, is_new?: boolean } }} */
	const props = $props();
</script>

<svelte:head>
	<title>Editable Website</title>
</svelte:head>

<!--
	BUG: When navigating from / with preloading on the Svedit component ends up
	with a stale session, breaking editing.
	See https://github.com/michael/editable-website/issues/40
-->
<!-- {#key initial_doc.document_id} -->
<App {...props.data} />
<!-- {/key} -->
