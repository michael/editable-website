<script>
	/**
	 * Prototype data for a future multi-page drawer.
	 * Once authentication + real multi-page data exists, this can be replaced
	 * by props / derived session data.
	 */

	const drafts = [
		{ id: 'draft-1', title: 'Unlinked page 1' },
		{ id: 'draft-2', title: 'Unlinked page 2' },
		{ id: 'draft-3', title: 'Unlinked page 3' },
		{ id: 'draft-4', title: 'Landing draft' },
		{ id: 'draft-5', title: 'Case study draft' }
	];

	const sitemap = {
		id: 'home',
		title: 'Home',
		children: [
			{
				id: 'projects',
				title: 'Projects',
				children: [
					{ id: 'project-1', title: 'Project 1', children: [] },
					{ id: 'project-2', title: 'Project 2', children: [] },
					{ id: 'project-3', title: 'Project 3', children: [] }
				]
			},
			{
				id: 'about',
				title: 'About',
				children: []
			}
		]
	};
</script>

<div class="pages-drawer">
	<section class="section">
		<div class="section-header">
			<h3>{drafts.length} drafts</h3>
		</div>

		<div class="drafts-strip" role="list" aria-label="Draft pages">
			{#each drafts as draft}
				<div role="listitem" class="draft-item">
					<button class="draft-card" type="button">
						<div class="page-illustration draft-illustration" aria-hidden="true">
							<div class="page-sheet">
								<div class="line long"></div>
								<div class="line"></div>
								<div class="line short"></div>
							</div>
						</div>
						<div class="draft-title">{draft.title}</div>
					</button>
				</div>
			{/each}
		</div>
	</section>

	<section class="section">
		<div class="section-header">
			<h3>12 pages</h3>
		</div>

		<div class="tree">
			{#snippet node_item(node, depth = 0)}
				<div class="tree-node" style={`--depth:${depth};`}>
					<button class="tree-row" type="button">
						<div class="tree-indent" aria-hidden="true"></div>

						<div class="page-illustration tree-illustration" aria-hidden="true">
							<div class="page-sheet compact">
								<div class="line long"></div>
								<div class="line"></div>
								<div class="line short"></div>
							</div>
						</div>

						<div class="tree-label">{node.title}</div>
					</button>

					{#if node.children?.length}
						<div class="tree-children">
							{#each node.children as child}
								{@render node_item(child, depth + 1)}
							{/each}
						</div>
					{/if}
				</div>
			{/snippet}

			{@render node_item(sitemap)}
		</div>
	</section>
</div>

<style>
	.pages-drawer {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.section-header h3 {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--foreground, black);
	}

	.drafts-strip {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 8.4rem;
		gap: 1rem;
		overflow-x: auto;
		padding: 0.15rem 0.05rem 0.35rem;
		scrollbar-width: thin;
		-webkit-overflow-scrolling: touch;
	}

	.draft-item {
		display: block;
	}

	.draft-card,
	.tree-row {
		border: 0;
		background: transparent;
		cursor: pointer;
		text-align: left;
		transition: background-color 140ms ease;
		outline: none;
	}

	.draft-card {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		width: 100%;
		padding: 0.45rem;
		border-radius: 1rem;
	}

	.tree-row {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		width: 100%;
		min-height: 3.35rem;
		padding: 0.45rem 0.6rem 0.45rem calc(0.6rem + var(--depth) * 1rem);
		border-radius: 0.95rem;
	}

	.draft-card:hover,
	.draft-card:focus-visible,
	.tree-row:hover,
	.tree-row:focus-visible {
		background: var(--svedit-editing-fill);
	}

	.page-illustration {
		display: grid;
		place-items: center;
		border-radius: 0.9rem;
		background: transparent;
	}

	.draft-illustration {
		width: 100%;
		aspect-ratio: 3 / 4;
	}

	.tree-illustration {
		width: 2.65rem;
		aspect-ratio: 3 / 4;
		flex: 0 0 auto;
	}

	.page-sheet {
		width: 72%;
		height: 76%;
		border-radius: 0.52rem;
		background:
			linear-gradient(
				180deg,
				oklch(100% 0 0) 0%,
				oklch(98.5% 0 0) 100%
			);
		box-shadow:
			0 1px 2px oklch(0% 0 0 / 0.04),
			0 8px 18px oklch(0% 0 0 / 0.08),
			inset 0 0 0 1px oklch(90% 0 0);
		padding: 0.45rem 0.35rem;
		display: flex;
		flex-direction: column;
		gap: 0.22rem;
	}

	.page-sheet.compact {
		padding: 0.32rem 0.26rem;
		gap: 0.16rem;
	}

	.line {
		height: 0.16rem;
		border-radius: 999px;
		background: oklch(78% 0 0 / 0.75);
	}

	.page-sheet.compact .line {
		height: 0.11rem;
	}

	.line.long {
		width: 100%;
	}

	.line.short {
		width: 55%;
	}

	.draft-title {
		font-size: 0.8rem;
		font-weight: 600;
		line-height: 1.2;
		color: var(--foreground, black);
	}

	.tree {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.tree-node {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.tree-indent {
		width: 0;
		height: 0;
	}

	.tree-label {
		font-size: 0.92rem;
		font-weight: 600;
		line-height: 1.2;
		color: var(--foreground, black);
	}

	.tree-children {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	@media (max-width: 640px) {
		.drafts-strip {
			grid-auto-columns: 7.5rem;
			gap: 0.85rem;
		}

		.draft-card {
			padding: 0.4rem;
			gap: 0.55rem;
			border-radius: 0.9rem;
		}

		.draft-title {
			font-size: 0.74rem;
		}

		.tree-row {
			min-height: 3rem;
			padding: 0.4rem 0.5rem 0.4rem calc(0.5rem + var(--depth) * 0.85rem);
			gap: 0.65rem;
			border-radius: 0.9rem;
		}

		.tree-illustration {
			width: 2.3rem;
		}

		.page-sheet {
			width: 74%;
			height: 78%;
		}

		.tree-label {
			font-size: 0.88rem;
		}
	}
</style>