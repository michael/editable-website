<script>
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" type="image/svg+xml" href="logo.svg" /></svelte:head>
{@render children()}
