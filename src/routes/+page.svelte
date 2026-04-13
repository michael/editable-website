<script>
	import PageEditor from './components/PageEditor.svelte';
	import { demo_doc } from '$lib/demo_doc.js';

	/** @type {{ data: { has_backend?: boolean, is_admin?: boolean, document: any, slug: string | null } }} */
	const props = $props();
	const page_data = $derived(props.data);
	const has_backend = $derived(page_data.has_backend ?? false);
	const is_admin = $derived(page_data.is_admin ?? false);
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
<!-- {#key initial_doc.document_id} -->
<PageEditor
	initial_doc={initial_doc}
	initial_slug={has_backend ? page_data.slug : null}
	has_backend={has_backend}
	is_admin={is_admin}
	is_new={false}
/>
<!-- {/key} -->
