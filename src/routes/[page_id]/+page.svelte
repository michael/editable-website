<script>
	import PageEditor from '../components/PageEditor.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Editable Website</title>
</svelte:head>

{#key data.document.document_id}
	<PageEditor initial_doc={data.document} has_backend={true} is_new={false} />
{/key}
