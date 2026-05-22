<script>
	import { getContext } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Drawer from './Drawer.svelte';
	import AuthDialog from './AuthDialog.svelte';

	let {
		app_commands = null,
		editable = false,
		has_backend = false,
		is_admin = false,
		show_browse = false,
		show_new = true,
		show_edit = false,
		allow_signed_out_new = false,
		inline = false
	} = $props();

	const app = getContext('app');

	let local_auth_dialog_open = $state(false);
	let local_auth_dialog_mode = $state('choice');
	let auth_action = $state('edit');

	let effective_has_backend = $derived(app?.has_backend ?? has_backend);
	let effective_is_admin = $derived(app?.is_admin ?? is_admin);
	let auth_dialog_open = $derived(app?.auth_dialog_open ?? local_auth_dialog_open);
	let auth_dialog_mode = $derived(app?.auth_dialog_mode ?? local_auth_dialog_mode);
	let auth_dialog_label = $derived(auth_dialog_mode === 'login' ? 'Admin login' : 'Edit options');
	let edit_command = $derived(app_commands?.edit_document ?? null);
	let logout_command = $derived(app_commands?.logout_admin ?? null);
	let can_show_browse = $derived(show_browse && effective_has_backend && effective_is_admin);
	let can_show_new = $derived(
		show_new &&
			effective_has_backend &&
			!editable &&
			(effective_is_admin || allow_signed_out_new)
	);
	let can_show_edit = $derived(
		show_edit &&
			edit_command &&
			!edit_command.disabled &&
			(!effective_has_backend || effective_is_admin)
	);
	let can_show_logout = $derived(effective_has_backend && effective_is_admin && !editable);
	let has_visible_tools = $derived(can_show_browse || can_show_new || can_show_edit || can_show_logout);

	const TW_TOOLBAR_POSITION = 'bottom-0 sm:bottom-3 right-5 sm:right-7 md:right-10 lg:right-14';
	const TW_TOOLBAR_LEFT = 'left-5 sm:left-7 md:left-auto';
	const TW_TOOLBAR_BTN = 'flex items-center justify-center size-9 rounded-full text-(--foreground) bg-(--background) border border-[color-mix(in_oklch,var(--background)_91%,var(--foreground))] cursor-pointer pointer-events-auto shadow-sm transition-all duration-150 active:scale-95 active:translate-y-px outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1';
	const TW_TOOLBAR_BTN_HOVER = 'hover:bg-[color-mix(in_oklch,var(--background)_96%,var(--foreground))] hover:border-[color-mix(in_oklch,var(--background)_88%,var(--foreground))] active:bg-[color-mix(in_oklch,var(--background)_94%,var(--foreground))] active:border-[color-mix(in_oklch,var(--background)_84%,var(--foreground))] active:scale-95 active:translate-y-px';

	let was_auth_dialog_open = false;

	$effect(() => {
		if (!auth_dialog_open && was_auth_dialog_open) {
			auth_action = 'edit';
			set_auth_dialog_mode('choice');
		}

		was_auth_dialog_open = auth_dialog_open;
	});

	function set_auth_dialog_open(value) {
		if (app) {
			app.auth_dialog_open = value;
			return;
		}

		local_auth_dialog_open = value;
	}

	function set_auth_dialog_mode(value) {
		if (app) {
			app.auth_dialog_mode = value;
			return;
		}

		local_auth_dialog_mode = value;
	}

	function open_auth_dialog(next_auth_action, mode = 'login') {
		auth_action = next_auth_action;
		set_auth_dialog_mode(mode);
		set_auth_dialog_open(true);
	}

	function close_auth_dialog() {
		auth_action = 'edit';

		if (app?.close_auth_dialog) {
			app.close_auth_dialog();
			return;
		}

		local_auth_dialog_mode = 'choice';
		local_auth_dialog_open = false;
	}

	async function handle_login_success() {
		const completed_auth_action = auth_action;
		auth_action = 'edit';

		if (app?.handle_auth_success) {
			await app.handle_auth_success();
		} else {
			await invalidateAll();
			close_auth_dialog();
		}

		if (completed_auth_action === 'new') {
			await goto(resolve('/new'));
		}
	}

	async function create_new_presentation() {
		if (effective_is_admin) {
			await goto(resolve('/new'));
			return;
		}

		open_auth_dialog('new', 'login');
	}

	function edit_document() {
		auth_action = 'edit';
		edit_command?.execute();
	}

	async function logout_admin() {
		if (logout_command) {
			await logout_command.execute();
			return;
		}

		try {
			const api_module = await import('$lib/api.remote.js');
			await api_module.logout_admin();
			await invalidateAll();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Logout failed.');
		}
	}
</script>

{#snippet toolbar_buttons()}
	<div class="flex items-center gap-1">
		{#if can_show_browse}
			<a
				class="{TW_TOOLBAR_BTN} {TW_TOOLBAR_BTN_HOVER}"
				href={resolve('/')}
				title="Browse"
				aria-label="Browse"
			>
				<svg
					class="size-4"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 15 15"
					fill="none"
					aria-hidden="true"
				>
					<rect x="1.5" y="1.5" width="5" height="5" rx="0.5" stroke="currentColor" />
					<rect x="8.5" y="1.5" width="5" height="5" rx="0.5" stroke="currentColor" />
					<rect x="1.5" y="8.5" width="5" height="5" rx="0.5" stroke="currentColor" />
					<rect x="8.5" y="8.5" width="5" height="5" rx="0.5" stroke="currentColor" />
				</svg>
			</a>
		{/if}

		{#if can_show_new}
			<button
				type="button"
				class="{TW_TOOLBAR_BTN} {TW_TOOLBAR_BTN_HOVER}"
				onclick={() => void create_new_presentation()}
				title="New presentation"
				aria-label="New presentation"
			>
				<svg
					class="size-4"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 15 15"
					fill="none"
					aria-hidden="true"
				>
					<path d="M7.5 3V12M3 7.5H12" stroke="currentColor" stroke-linecap="square" />
				</svg>
			</button>
		{/if}

		{#if can_show_edit}
			<button
				type="button"
				class="{TW_TOOLBAR_BTN} {TW_TOOLBAR_BTN_HOVER}"
				onclick={edit_document}
				title="Edit (⌘ E)"
				aria-label="Edit"
			>
				<svg
					class="size-4"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 15 15"
					fill="none"
					aria-hidden="true"
				>
					<path
						d="M12.6017 4.51322L10.4804 2.3919M12.6017 4.51322L3.76282 13.3521L1.77642 13.5C1.58297 13.5266 1.48259 13.4069 1.5 13.2107L1.6415 11.2308L10.4804 2.3919M12.6017 4.51322C12.9552 4.15965 12.9552 4.15969 12.9552 4.15969L13.3088 3.80612C13.6623 3.45255 13.4942 2.58389 12.9552 2.0384C12.4189 1.50211 11.541 1.33123 11.1875 1.6848L10.8339 2.03837C10.8339 2.03837 10.8339 2.03833 10.4804 2.3919"
						stroke="currentColor"
					/>
				</svg>
			</button>
		{/if}

		{#if can_show_logout}
			<button
				type="button"
				class="{TW_TOOLBAR_BTN} {TW_TOOLBAR_BTN_HOVER}"
				onclick={logout_admin}
				title="Logout"
				aria-label="Logout"
			>
				<svg
					class="size-4"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 15 15"
					fill="none"
					aria-hidden="true"
				>
					<path d="M6 2.5H3.5V12.5H6" stroke="currentColor" />
					<path d="M8.5 4.5L11.5 7.5L8.5 10.5" stroke="currentColor" />
					<path d="M11 7.5H5" stroke="currentColor" />
				</svg>
			</button>
		{/if}
	</div>
{/snippet}

{#if !editable && has_visible_tools}
	{#if inline}
		{@render toolbar_buttons()}
	{:else}
		<div class="fixed {TW_TOOLBAR_POSITION} {TW_TOOLBAR_LEFT} z-50">
			<div class="overflow-x-auto">
				<div class="py-2 px-0.5 flex items-center gap-1.5 sm:gap-3 w-max ml-auto">
					{@render toolbar_buttons()}
				</div>
			</div>
		</div>
	{/if}
{/if}

{#if auth_dialog_open}
	{#if app}
		<Drawer bind:open={app.auth_dialog_open} label={auth_dialog_label} drawer_height_mode="auto">
			<AuthDialog
				initial_step={auth_dialog_mode}
				onclose={close_auth_dialog}
				onedit_for_fun={app.edit_for_fun}
				onlogin_success={handle_login_success}
			/>
		</Drawer>
	{:else}
		<Drawer bind:open={local_auth_dialog_open} label={auth_dialog_label} drawer_height_mode="auto">
			<AuthDialog
				initial_step={auth_dialog_mode}
				onclose={close_auth_dialog}
				onlogin_success={handle_login_success}
			/>
		</Drawer>
	{/if}
{/if}
