<script>
	import PageEditor from '../components/PageEditor.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Editable Website</title>
</svelte:head>

<PageEditor initial_doc={data.document} has_backend={true} is_new={false} />
