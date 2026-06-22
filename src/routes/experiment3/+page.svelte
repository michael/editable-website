<script>
	const middle_items = [
		{ label: 'Home', href: '/' },
		{ label: 'Projects', href: '/projects' },
		{ label: 'About', href: '/about' },
		{ label: 'Home', href: '/' },
		{ label: 'Projects', href: '/projects' },
		{ label: 'About', href: '/about' }
	];
</script>

<div class="shell">
	<div class="row">
		<div class="side left">
			<a href="/">ACME</a>
		</div>

		<nav class="middle">
			{#each middle_items as item, index (index)}
				<a href={item.href}>{item.label}</a>
			{/each}
		</nav>

		<div class="side right">
			<a href="/login">Sign in</a>
		</div>
	</div>
</div>

<style>
	.shell {
		margin: 0 auto;
		max-width: 56rem;
		padding: 0 1.5rem;
		overflow-x: auto;
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		align-items: center;
		gap: 2.5rem;
		min-width: 100%;
		width: max-content;
		padding-block: 1.25rem;
	}

	.side {
		min-width: max-content;
	}

	.left {
		justify-self: start;
	}

	.right {
		justify-self: end;
	}

	.middle {
		display: flex;
		align-items: center;
		gap: 2rem;
		width: max-content;
		min-width: max-content;
	}

	.middle a,
	.side a {
		white-space: nowrap;
	}
</style>
