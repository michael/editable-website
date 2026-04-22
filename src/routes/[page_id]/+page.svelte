<script>
	import App from '../components/App.svelte';

	/** @type {{ data: { document: any, slug: string | null, is_admin?: boolean, has_backend?: boolean, is_new?: boolean } }} */
	const props = $props();
</script>

<App {...props.data} has_backend={true} is_new={false} />
