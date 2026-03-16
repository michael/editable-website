<script>
	let { session, app_commands, editable, focus_canvas } = $props();

	function prevent_focus_steal(event) {
		event.preventDefault();
	}

	function handle_click(command) {
		command.execute();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="fixed bottom-4 right-4 z-50 flex items-center gap-3" onmousedown={prevent_focus_steal}>
	{#if !editable}
		<!-- Read mode: Edit button -->
		{#if !app_commands.edit_document.disabled}
			<button
				class="primary-btn"
				onclick={() => app_commands.edit_document.execute()}
				title="Edit (⌘E)"
			>
				Edit
			</button>
		{/if}
	{:else}
		<!-- Edit mode -->

		<!-- Text formatting group (visible during text selection) -->
		{#if session.selection?.type === 'text'}
			<div class="btn-group">
				<!-- Bold -->
				<button
					class="toolbar-btn"
					class:active={session.commands.toggle_strong?.active}
					onclick={() => handle_click(session.commands.toggle_strong)}
					disabled={session.commands.toggle_strong?.disabled}
					title="Bold (⌘B)"
				>
					<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
						<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
					</svg>
				</button>

				<!-- Italic -->
				<button
					class="toolbar-btn"
					class:active={session.commands.toggle_emphasis?.active}
					onclick={() => handle_click(session.commands.toggle_emphasis)}
					disabled={session.commands.toggle_emphasis?.disabled}
					title="Italic (⌘I)"
				>
					<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="19" y1="4" x2="10" y2="4" />
						<line x1="14" y1="20" x2="5" y2="20" />
						<line x1="15" y1="4" x2="9" y2="20" />
					</svg>
				</button>

				<!-- Highlight -->
				<button
					class="toolbar-btn"
					class:active={session.commands.toggle_highlight?.active}
					onclick={() => handle_click(session.commands.toggle_highlight)}
					disabled={session.commands.toggle_highlight?.disabled}
					title="Highlight (⌘U)"
				>
					<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
						<line x1="4" y1="21" x2="20" y2="21" />
					</svg>
				</button>

				<!-- Link -->
				<button
					class="toolbar-btn"
					class:active={session.commands.toggle_link?.active}
					onclick={() => handle_click(session.commands.toggle_link)}
					disabled={session.commands.toggle_link?.disabled}
					title="Link (⌘K)"
				>
					<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
						<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
					</svg>
				</button>
			</div>
		{/if}

		<!-- Type / Layout group (always visible, disabled when not applicable) -->
		<div class="btn-group">
			<!-- Type: cycle to next node type -->
			<button
				class="toolbar-btn"
				onclick={() => handle_click(session.commands.cycle_node_type_next)}
				disabled={session.commands.cycle_node_type_next?.disabled}
				title="Cycle type (⌃⇧↓)"
			>
				<!-- T with small arrows icon -->
				<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="6" y1="4" x2="18" y2="4" />
					<line x1="12" y1="4" x2="12" y2="14" />
					<polyline points="8 18 12 22 16 18" />
					<line x1="12" y1="14" x2="12" y2="22" />
				</svg>
			</button>

			<!-- Layout: cycle to next layout -->
			<button
				class="toolbar-btn"
				onclick={() => handle_click(session.commands.cycle_layout_next)}
				disabled={session.commands.cycle_layout_next?.disabled}
				title="Cycle layout (⌃⇧→)"
			>
				<!-- T with right arrow icon -->
				<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="4" y1="6" x2="4" y2="18" />
					<line x1="4" y1="12" x2="14" y2="12" />
					<polyline points="18 8 22 12 18 16" />
					<line x1="14" y1="12" x2="22" y2="12" />
				</svg>
			</button>
		</div>

		<!-- Stable right group: Undo / Redo / Save -->
		<div class="btn-group">
			<button
				class="toolbar-btn"
				onclick={() => handle_click(session.commands.undo)}
				disabled={session.commands.undo?.disabled}
				title="Undo (⌘Z)"
			>
				<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="1 4 1 10 7 10" />
					<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
				</svg>
			</button>
			<button
				class="toolbar-btn"
				onclick={() => handle_click(session.commands.redo)}
				disabled={session.commands.redo?.disabled}
				title="Redo (⌘⇧Z)"
			>
				<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="23 4 23 10 17 10" />
					<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
				</svg>
			</button>
		</div>

		{#if !app_commands.save_document.disabled}
			<button
				class="primary-btn"
				onclick={() => app_commands.save_document.execute()}
				title="Save (⌘S)"
			>
				Save
			</button>
		{/if}
	{/if}
</div>

<style>
	.btn-group {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		color: var(--foreground);
		background: white;
		cursor: pointer;
		box-shadow: 0 1px 3px oklch(0 0 0 / 0.12), 0 1px 2px oklch(0 0 0 / 0.06);
		transition: background-color 0.15s, color 0.15s;

		&:hover:not(:disabled) {
			background-color: oklch(from var(--svedit-brand) 0.95 0.02 h);
			color: var(--svedit-editing-stroke);
		}

		&:disabled {
			color: oklch(0 0 0 / 0.2);
			cursor: not-allowed;
		}

		&.active {
			color: var(--svedit-editing-stroke);
		}
	}

	.primary-btn {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		border-radius: 9999px;
		color: white;
		background-color: var(--svedit-brand);
		box-shadow: 0 1px 3px oklch(0 0 0 / 0.12), 0 1px 2px oklch(0 0 0 / 0.06);
		transition: background-color 0.15s;

		&:hover {
			background-color: oklch(from var(--svedit-brand) calc(l - 0.05) c h);
		}
	}
</style>