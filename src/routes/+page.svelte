<script>
	import PageEditor from './components/PageEditor.svelte';
	import { demo_doc } from '$lib/demo_doc.js';

	const props = $props();
	const page_data = $derived(props.data);
	const has_backend = $derived(page_data.has_backend);
	const initial_doc = $derived(has_backend ? page_data.document : demo_doc);
</script>

<svelte:head>
	<title>Editable Website</title>
</svelte:head>

<!--
	BUG: When navigating from / with preloading on the Svedit component ends up
	with a stale session, breaking editing.
	See https://github.com/michael/editable-website/issues/40
-->
{#key initial_doc.document_id}
	<PageEditor
		initial_doc={initial_doc}
		initial_slug={has_backend ? page_data.slug : null}
		has_backend={has_backend}
		is_new={false}
	/>
{/key}