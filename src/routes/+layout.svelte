<script>
	import '../app.css';

	let { data, children } = $props();
</script>

<svelte:head>
	{#if data.favicon}
		<link rel="icon" type={data.favicon.type ?? undefined} href={data.favicon.href} />
	{/if}
</svelte:head>
{@render children()}
