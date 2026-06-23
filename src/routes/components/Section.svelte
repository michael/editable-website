<script>
	let { children, ...rest } = $props();
</script>

<div class="section" {...rest}>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.section {
		border: 1px dashed var(--slate-a5);
		padding: 1rem;
		margin-block: 1rem;
		border-radius: 8px;
	}
</style>
