<script>
	let { session, app_commands, editable } = $props();

	const TW_TOOLBAR_POSITION = 'bottom-5 right-5 sm:right-7 md:right-10 lg:right-14';
	// On mobile also pin to left edge so the toolbar can scroll horizontally
	const TW_TOOLBAR_LEFT = 'left-5 sm:left-7 md:left-auto';

	const TW_TOOLBAR_BTN = 'flex items-center justify-center size-9 rounded-full text-(--foreground) bg-white cursor-pointer pointer-events-auto shadow-md transition-colors duration-150';
	const TW_TOOLBAR_BTN_DISABLED = 'text-[oklch(from_var(--foreground)_0.8_0_0)] !cursor-not-allowed';
	const TW_TOOLBAR_BTN_HOVER = 'hover:bg-[oklch(from_var(--svedit-brand)_0.95_0.02_h)] hover:text-(--svedit-editing-stroke)';

	function handle_btn_mousedown(event, command) {
		event.preventDefault();
		if (command?.disabled) return;
		command.execute();
	}
</script>

<div class="fixed {TW_TOOLBAR_POSITION} {TW_TOOLBAR_LEFT} z-50 select-none pointer-events-none">
	<div class="overflow-x-auto -mb-3 pb-3 -ml-3 pl-3">
		<div class="flex items-center gap-1.5 sm:gap-3 w-max ml-auto">
			{#if !editable}
				<!-- Read mode: Edit button -->
				{#if !app_commands.edit_document.disabled}
					<button
						class="px-4 py-2 text-sm font-semibold cursor-pointer pointer-events-auto rounded-full text-white bg-(--svedit-brand) shadow-md transition-colors duration-150 hover:brightness-90"
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
					<div class="flex items-center gap-1">
						<!-- Bold -->
						<button
							class="{TW_TOOLBAR_BTN} {session.commands.toggle_strong?.disabled ? TW_TOOLBAR_BTN_DISABLED : TW_TOOLBAR_BTN_HOVER}"
							class:!text-(--svedit-editing-stroke)={session.commands.toggle_strong?.active}
							onmousedown={(e) => handle_btn_mousedown(e, session.commands.toggle_strong)}
							title="Bold (⌘B)"
						>
							<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
								<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
							</svg>
						</button>

						<!-- Italic -->
						<button
							class="{TW_TOOLBAR_BTN} {session.commands.toggle_emphasis?.disabled ? TW_TOOLBAR_BTN_DISABLED : TW_TOOLBAR_BTN_HOVER}"
							class:!text-(--svedit-editing-stroke)={session.commands.toggle_emphasis?.active}
							onmousedown={(e) => handle_btn_mousedown(e, session.commands.toggle_emphasis)}
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
							class="{TW_TOOLBAR_BTN} {session.commands.toggle_highlight?.disabled ? TW_TOOLBAR_BTN_DISABLED : TW_TOOLBAR_BTN_HOVER}"
							class:!text-(--svedit-editing-stroke)={session.commands.toggle_highlight?.active}
							onmousedown={(e) => handle_btn_mousedown(e, session.commands.toggle_highlight)}
							title="Highlight (⌘U)"
						>
							<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
								<line x1="4" y1="21" x2="20" y2="21" />
							</svg>
						</button>

						<!-- Link -->
						<button
							class="{TW_TOOLBAR_BTN} {session.commands.toggle_link?.disabled ? TW_TOOLBAR_BTN_DISABLED : TW_TOOLBAR_BTN_HOVER}"
							class:!text-(--svedit-editing-stroke)={session.commands.toggle_link?.active}
							onmousedown={(e) => handle_btn_mousedown(e, session.commands.toggle_link)}
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
				<div class="flex items-center gap-1">
					<!-- Type: cycle to next node type -->
					<button
						class="{TW_TOOLBAR_BTN} {session.commands.cycle_node_type_next?.disabled ? TW_TOOLBAR_BTN_DISABLED : TW_TOOLBAR_BTN_HOVER}"
						onmousedown={(e) => handle_btn_mousedown(e, session.commands.cycle_node_type_next)}
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
						class="{TW_TOOLBAR_BTN} {session.commands.cycle_layout_next?.disabled ? TW_TOOLBAR_BTN_DISABLED : TW_TOOLBAR_BTN_HOVER}"
						onmousedown={(e) => handle_btn_mousedown(e, session.commands.cycle_layout_next)}
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
				<div class="flex items-center gap-1">
					<button
						class="{TW_TOOLBAR_BTN} {session.commands.undo?.disabled ? TW_TOOLBAR_BTN_DISABLED : TW_TOOLBAR_BTN_HOVER}"
						onmousedown={(e) => handle_btn_mousedown(e, session.commands.undo)}
						title="Undo (⌘Z)"
					>
						<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="1 4 1 10 7 10" />
							<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
						</svg>
					</button>
					<button
						class="{TW_TOOLBAR_BTN} {session.commands.redo?.disabled ? TW_TOOLBAR_BTN_DISABLED : TW_TOOLBAR_BTN_HOVER}"
						onmousedown={(e) => handle_btn_mousedown(e, session.commands.redo)}
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
						class="px-4 py-2 text-sm font-semibold cursor-pointer pointer-events-auto rounded-full text-white bg-(--svedit-brand) shadow-md transition-colors duration-150 hover:brightness-90"
						onclick={() => app_commands.save_document.execute()}
						title="Save (⌘S)"
					>
						Save
					</button>
				{/if}
			{/if}
		</div>
	</div>
</div>
