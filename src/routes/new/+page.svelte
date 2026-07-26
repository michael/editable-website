<script lang="ts">
	import App from '../components/App.svelte';
	import { create_duplicate_doc, create_empty_doc } from '#lib/new_page.js';

	const props = $props();
	const data = $derived({
		...props.data,
		document: props.data.source_document
			? create_duplicate_doc(props.data.source_document, props.data.shared_documents)
			: create_empty_doc(props.data.shared_documents ?? null),
		is_new: true
	});
</script>

<App {...data} />
