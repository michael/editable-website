<script>
	import App from '../components/App.svelte';
	import { create_empty_doc } from '$lib/new_page.js';

	const props = $props();
	const data = $derived({
		...props.data,
		document: create_empty_doc(props.data.shared_documents ?? null),
		is_new: true
	});
</script>

<svelte:head>
	<title>New page</title>
</svelte:head>

<App {...data} />
