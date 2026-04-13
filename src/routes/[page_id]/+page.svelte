<script>
	import PageEditor from '../components/PageEditor.svelte';

	/** @type {{ data: { document: any, slug: string | null, is_admin?: boolean } }} */
	const props = $props();
	const page_data = $derived(props.data);
	const is_admin = $derived(page_data.is_admin ?? false);
</script>

<svelte:head>
	<title>Editable Website</title>
</svelte:head>

<PageEditor
	initial_doc={page_data.document}
	initial_slug={page_data.slug}
	has_backend={true}
	is_admin={is_admin}
	is_new={false}
/>
