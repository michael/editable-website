<script>
	import App from '../components/App.svelte';

	/** @type {{ data: { document: any, is_admin?: boolean, has_backend?: boolean, is_new?: boolean, origin?: string | null } }} */
	const props = $props();
</script>

<App {...props.data} is_new={false} />
