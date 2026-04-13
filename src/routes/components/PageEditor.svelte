<script>
	import { setContext } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Svedit, KeyMapper, Command, define_keymap } from 'svedit';
	import Toolbar from './Toolbar.svelte';
	import SaveProgressModal from './SaveProgressModal.svelte';
	import { create_session } from '../create_session.js';
	import { create_page_browser, set_page_browser } from './page_browser_context.svelte.js';

	/** @type {{ initial_doc: any, initial_slug?: string | null, has_backend?: boolean, is_new?: boolean, is_admin?: boolean }} */
	let props = $props();

	let initial_doc = $derived(props.initial_doc);
	let is_new = $derived(props.is_new ?? false);
	let server_is_admin = $derived(!!(props.is_admin ?? false));

	let initial_doc_json = $derived(JSON.stringify(props.initial_doc));

	let app_el = $state();
	let svedit_ref = $state();
	let editable = $state(false);
	let current_is_new = $state(false);
	let is_admin_override = $state(/** @type {boolean | null} */ (null));
	let is_admin = $derived(is_admin_override ?? server_is_admin);
	let edit_mode = $state(/** @type {'admin' | 'fun' | null} */ (null));

	let save_progress_visible = $state(false);
	let save_progress_message = $state('');
	let save_progress_done = $state(false);

	let browser_data_version = $state(0);

	let auth_dialog_open = $state(false);
	let auth_dialog_ref = $state();
	let auth_password = $state('');
	let auth_error = $state('');
	let auth_pending = $state(false);

	setContext('has_backend', () => props.has_backend ?? true);
	setContext('is_admin', () => is_admin);
	setContext('edit_mode', () => edit_mode);

	const page_browser = create_page_browser({
		goto,
		is_admin: () => is_admin
	});

	Object.defineProperty(page_browser, 'version', {
		get() {
			return browser_data_version;
		}
	});

	page_browser.invalidate = invalidate_page_browser_data;

	set_page_browser(page_browser);

	$effect(() => {
		document.documentElement.style.scrollBehavior = editable ? 'auto' : 'smooth';
	});

	$effect(() => {
		current_is_new = !!is_new;
		if (current_is_new) {
			editable = true;
			edit_mode = 'admin';
		}
	});

	function focus_canvas() {
		if (svedit_ref) {
			svedit_ref.focus_canvas();
		}
	}

	function invalidate_page_browser_data() {
		browser_data_version += 1;
	}

	function check_browser_support() {
		const ua = navigator.userAgent;
		let browser = null;
		let version = 0;

		if (ua.includes('Chrome/')) {
			browser = 'Chrome';
			version = parseInt(ua.match(/Chrome\/(\d+)/)?.[1] || '0');
		} else if (ua.includes('Firefox/')) {
			browser = 'Firefox';
			version = parseInt(ua.match(/Firefox\/(\d+)/)?.[1] || '0');
		} else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
			browser = 'Safari';
			version = parseInt(ua.match(/Version\/(\d+)/)?.[1] || '0');
		}

		const min_versions = { Chrome: 142, Firefox: 147, Safari: 26 };

		if (browser && min_versions[browser] && version < min_versions[browser]) {
			return { supported: false, browser, version, required: min_versions[browser] };
		}

		return { supported: true };
	}

	function open_auth_dialog() {
		auth_dialog_open = true;
		auth_password = '';
		auth_error = '';
	}

	function close_auth_dialog() {
		auth_dialog_open = false;
		auth_password = '';
		auth_error = '';
		auth_pending = false;
	}

	function handle_auth_dialog_click(event) {
		if (event.target === auth_dialog_ref) {
			close_auth_dialog();
		}
	}

	function handle_auth_dialog_cancel(event) {
		event.preventDefault();
		close_auth_dialog();
	}

	function enter_edit_mode(next_edit_mode) {
		editable = true;
		edit_mode = next_edit_mode;
		close_auth_dialog();
	}

	async function login_and_edit() {
		if (auth_pending) return;

		auth_pending = true;
		auth_error = '';

		try {
			const api_module = await import('$lib/api.remote.js');
			const result = await api_module.login_admin({ password: auth_password });

			if (result && result.ok === false && 'message' in result) {
				auth_error = result.message || 'Login failed.';
				return;
			}

			is_admin_override = true;
			await invalidateAll();
			enter_edit_mode('admin');
		} catch (err) {
			auth_error = err instanceof Error ? err.message : 'Login failed.';
		} finally {
			auth_pending = false;
		}
	}

	function edit_for_fun() {
		enter_edit_mode('fun');
	}

	class EditCommand extends Command {
		is_enabled() {
			return !this.context.editable;
		}

		execute() {
			const browser_check = check_browser_support();
			if (!browser_check.supported) {
				alert(
					`Your browser (${browser_check.browser} ${browser_check.version}) may not fully support the editor. For the best experience, please upgrade to ${browser_check.browser} ${browser_check.required} or newer.`
				);
			}

			if (!(props.has_backend ?? true) || is_admin) {
				enter_edit_mode('admin');
				return;
			}

			open_auth_dialog();
		}
	}

	class CancelCommand extends Command {
		is_enabled() {
			return this.context.editable;
		}

		async execute() {
			session.selection = null;

			if (current_is_new) {
				await goto(resolve('/'));
				return;
			}

			session = create_session(JSON.parse(initial_doc_json));
			this.context.editable = false;
			edit_mode = null;
		}
	}

	class SaveCommand extends Command {
		is_enabled() {
			return this.context.editable && edit_mode === 'admin';
		}

		async execute() {
			if (!(props.has_backend ?? true)) {
				console.log('Document saved', session.to_json());
				session.selection = null;
				this.context.editable = false;
				edit_mode = null;
				return;
			}

			if (edit_mode !== 'admin') {
				return;
			}

			const save_start = Date.now();

			const [
				api_module,
				asset_upload_module
			] = await Promise.all([
				import('$lib/api.remote.js'),
				import('$lib/client/asset_upload.js')
			]);

			/** @type {any} */
			const persist_document = api_module.save_document;
			/** @type {any} */
			const get_document = api_module.get_document;
			const {
				collect_blob_urls,
				wait_for_processing,
				has_pending_processing,
				ensure_processing,
				upload_pending,
				replace_blob_urls,
				cleanup_pending
			} = asset_upload_module;

			save_progress_visible = true;
			save_progress_done = false;
			save_progress_message = 'Saving…';

			try {
				let mapping = null;
				const pre_check = session.to_json();
				const blob_urls = collect_blob_urls(pre_check.nodes);

				if (blob_urls.length > 0) {
					const total = blob_urls.length;

					await ensure_processing(blob_urls);

					if (has_pending_processing()) {
						save_progress_message =
							total === 1 ? 'Processing image…' : `Processing ${total} images…`;

						await wait_for_processing(({ done, total: processing_total }) => {
							if (processing_total > 1) {
								save_progress_message = `Processing image ${done + 1}/${processing_total}…`;
							}
						});
					}

					mapping = await upload_pending(blob_urls, ({ phase, index, total: upload_total }) => {
						if (phase === 'uploading') {
							save_progress_message = `Uploading image ${index}/${upload_total}…`;
						}
					});
				}

				save_progress_message = 'Saving…';

				const doc_json = session.to_json();
				if (mapping) {
					replace_blob_urls(doc_json.nodes, mapping);
				}

				/** @type {{ ok: boolean, document_id?: string, slug?: string, created?: boolean }} */
				const result = await persist_document({
					...doc_json,
					create: current_is_new
				});

				if (mapping) {
					const tr = session.tr;
					for (const [blob_url, entry] of mapping.entries()) {
						for (const node of Object.values(pre_check.nodes)) {
							if ((node.type === 'image' || node.type === 'video') && node.src === blob_url) {
								tr.set([node.id, 'src'], entry.asset_id);
								tr.set([node.id, 'width'], entry.width);
								tr.set([node.id, 'height'], entry.height);
							}
						}
					}
					session.apply(tr);
					cleanup_pending(mapping);
				}

				session.selection = null;
				this.context.editable = false;
				edit_mode = null;

				if (result?.created && result.document_id && result.slug) {
					try {
						await get_document(result.slug).run();
						current_is_new = false;
						invalidate_page_browser_data();
						await goto(resolve(`/${result.slug}`), { replaceState: true });
						return;
					} catch (read_back_err) {
						console.error('Created page could not be read back yet:', read_back_err);
						alert('The page was saved, but it is not readable yet. Staying on /new so you do not get sent to a missing page.');
					}
				}

				invalidate_page_browser_data();

				if (Date.now() - save_start > 3000) {
					save_progress_message = 'Successfully saved';
					save_progress_done = true;
					await new Promise((resolve) => setTimeout(resolve, 1500));
				}

				save_progress_visible = false;
			} catch (err) {
				console.error('Save failed:', err);
				save_progress_visible = false;
				alert('Save failed. Your changes have not been lost — please try again.');
			}
		}
	}

	class LogoutCommand extends Command {
		is_enabled() {
			return !!(props.has_backend ?? true) && is_admin && !editable;
		}

		async execute() {
			try {
				const api_module = await import('$lib/api.remote.js');
				await api_module.logout_admin();
				is_admin_override = false;
				edit_mode = null;
				page_browser.close?.();
				await invalidateAll();
			} catch (err) {
				alert(err instanceof Error ? err.message : 'Logout failed.');
			}
		}
	}

	const key_mapper = new KeyMapper();
	setContext('key_mapper', key_mapper);

	const app_command_context = {
		get editable() {
			return editable;
		},
		set editable(value) {
			editable = value;
		},
		get session() {
			return session;
		},
		get app_el() {
			return app_el;
		}
	};

	class BrowsePagesCommand extends Command {
		is_enabled() {
			return !!(props.has_backend ?? true) && is_admin && !this.context.editable;
		}

		execute() {
			page_browser.open_navigate();
		}
	}

	const app_commands = {
		edit_document: new EditCommand(app_command_context),
		cancel_editing: new CancelCommand(app_command_context),
		save_document: new SaveCommand(app_command_context),
		logout_admin: new LogoutCommand(app_command_context),
		browse_pages: new BrowsePagesCommand(app_command_context)
	};

	const app_key_map = define_keymap({
		'meta+escape,ctrl+escape': [app_commands.cancel_editing],
		'meta+e,ctrl+e': [app_commands.edit_document],
		'meta+p,ctrl+p': [app_commands.browse_pages],
		'meta+s,ctrl+s': [app_commands.save_document]
	});
	key_mapper.push_scope(app_key_map);

	let session = $derived.by(() => create_session(props.initial_doc));
	let loaded_document_id = $derived(props.initial_doc.document_id);

	$effect(() => {
		loaded_document_id;
		if (props.is_new ?? false) {
			editable = true;
			edit_mode = 'admin';
		}
	});

	$effect(() => {
		if (auth_dialog_open && auth_dialog_ref && !auth_dialog_ref.open) {
			auth_dialog_ref.showModal();
		} else if (!auth_dialog_open && auth_dialog_ref?.open) {
			auth_dialog_ref.close();
		}
	});
</script>

<svelte:window onkeydown={key_mapper.handle_keydown.bind(key_mapper)} />

<div class="demo-wrapper antialiased" bind:this={app_el}>
	<Toolbar
		{session}
		{app_commands}
		{editable}
		{focus_canvas}
	/>
	<Svedit {session} bind:editable bind:this={svedit_ref} path={[session.doc.document_id]} />

	<dialog
		bind:this={auth_dialog_ref}
		class="fixed inset-0 m-auto border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] bg-(--background) p-0 text-(--foreground) shadow-xl backdrop:bg-black/40"
		oncancel={handle_auth_dialog_cancel}
		onclick={handle_auth_dialog_click}
	>
		{#if auth_dialog_open}
			<div class="flex w-[min(28rem,calc(100vw-2rem))] flex-col gap-4 p-5">
				<div class="flex flex-col gap-1">
					<h2 class="text-base font-medium">Edit this page</h2>
					<p class="text-sm text-[color-mix(in_oklch,var(--foreground)_70%,transparent)]">
						Enter the admin password to save changes, or edit for fun without saving.
					</p>
				</div>

				<label class="flex flex-col gap-2">
					<span class="text-sm">Admin password</span>
					<input
						type="password"
						bind:value={auth_password}
						class="border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] bg-(--background) px-3 py-2 outline-none focus:border-(--svedit-editing-stroke)"
						onkeydown={(event) => {
							if (event.key === 'Enter') {
								void login_and_edit();
							}
						}}
					/>
				</label>

				{#if auth_error}
					<div class="text-sm text-red-600">{auth_error}</div>
				{/if}

				<div class="flex items-center justify-between gap-3">
					<button
						type="button"
						class="border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] px-3 py-2 text-sm"
						onclick={edit_for_fun}
					>
						Edit for fun
					</button>

					<div class="flex items-center gap-2">
						<button
							type="button"
							class="border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] px-3 py-2 text-sm"
							onclick={close_auth_dialog}
						>
							Cancel
						</button>
						<button
							type="button"
							class="bg-(--foreground) px-3 py-2 text-sm text-(--background)"
							onclick={() => void login_and_edit()}
							disabled={auth_pending}
						>
							{auth_pending ? 'Logging in…' : 'Login and edit'}
						</button>
					</div>
				</div>
			</div>
		{/if}
	</dialog>

	{#if props.has_backend ?? true}
		<SaveProgressModal
			visible={save_progress_visible}
			message={save_progress_message}
			done={save_progress_done}
		/>
	{/if}
</div>