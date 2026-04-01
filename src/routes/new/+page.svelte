<script>
	import PageEditor from '../components/PageEditor.svelte';
	import { create_empty_doc } from '$lib/new_page.js';

	const initial_doc = create_empty_doc();
</script>

<svelte:head>
	<title>Editable Website</title>
</svelte:head>

<PageEditor {initial_doc} has_backend={true} is_new={true} />