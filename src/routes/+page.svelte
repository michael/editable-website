<script>
	import App from './components/App.svelte';
	import PresentationIndex from './components/PresentationIndex.svelte';

	/** @type {{ data: { has_backend?: boolean, is_admin?: boolean, origin?: string | null, presentations?: any[] } }} */
	const props = $props();
</script>

{#if props.data.has_backend}
	<PresentationIndex
		presentations={props.data.presentations ?? []}
		has_backend={props.data.has_backend ?? false}
		is_admin={props.data.is_admin ?? false}
	/>
{:else}
	<App {...props.data} />
{/if}
