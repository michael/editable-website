<script>
	import PageEditor from '../components/PageEditor.svelte';

	const props = $props();
	const page_data = $derived(props.data);
</script>

<svelte:head>
	<title>Editable Website</title>
</svelte:head>

<PageEditor
	initial_doc={page_data.document}
	initial_slug={page_data.slug}
	has_backend={true}
	is_new={false}
/>
