<script>
	const nav_items = [
		{ label: 'ACME____________', href: '/', group: 'left' },
		{ label: 'Home', href: '/', group: 'middle', group_edge: 'start' },
		{ label: 'Projects', href: '/projects', group: 'middle' },
		{ label: 'About', href: '/about', group: 'middle', group_edge: 'end' },
		{ label: 'Si', href: '/login', group: 'right' }
	];
</script>

<div class="mx-auto max-w-4xl px-6 sm:px-10">
	<div class="nav-row flex items-center gap-4 py-5">
		{#each nav_items as nav_item, index (index)}
			<a
				href={nav_item.href}
				class={[
					'nav-item inline-flex shrink-0 items-center text-sm text-(--foreground)',
					nav_item.group === 'middle' && 'nav-middle',
					nav_item.group_edge === 'start' && 'nav-middle-start',
					nav_item.group_edge === 'end' && 'nav-middle-end',
					nav_item.group === 'right' && 'nav-right'
				]}
			>
				{nav_item.label}
			</a>
		{/each}
	</div>
</div>

<style>
	.nav-row > .nav-item {
		flex: 0 0 auto;
	}

	.nav-row > .nav-middle-start {
		margin-inline-start: auto;
	}

	.nav-row > .nav-middle-end {
		margin-inline-end: auto;
	}
</style>
