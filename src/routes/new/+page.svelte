<script>
	import PageEditor from '../components/PageEditor.svelte';
	import { create_empty_doc } from '$lib/new_page.js';

	const props = $props();
	const has_backend = $derived(props.data.has_backend ?? true);
	const shared_documents = $derived(props.data.shared_documents ?? null);
	const initial_doc = $derived(create_empty_doc(shared_documents));
</script>

<svelte:head>
	<title>Editable Website</title>
</svelte:head>

<PageEditor initial_doc={initial_doc} has_backend={has_backend} is_new={true} />