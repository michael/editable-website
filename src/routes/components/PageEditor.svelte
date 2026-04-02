<script>
	import { setContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { Svedit, KeyMapper, Command, define_keymap } from 'svedit';
	import Toolbar from './Toolbar.svelte';
	import SaveProgressModal from './SaveProgressModal.svelte';
	import { create_session } from '../create_session.js';
	import { create_page_browser, set_page_browser } from './page_browser_context.svelte.js';

	/** @type {{ initial_doc: any, has_backend?: boolean, is_new?: boolean }} */
	let {
		initial_doc,
		has_backend = true,
		is_new = false
	} = $props();

	let initial_doc_json = $derived(JSON.stringify(initial_doc));

	let app_el = $state();
	let svedit_ref = $state();
	let editable = $state(false);
	let current_is_new = $state(false);

	let save_progress_visible = $state(false);
	let save_progress_message = $state('');
	let save_progress_done = $state(false);

	let browser_data_version = $state(0);

	setContext('has_backend', has_backend);

	const page_browser = create_page_browser({ goto });

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
			this.context.editable = true;
		}
	}

	class CancelCommand extends Command {
		is_enabled() {
			return this.context.editable;
		}

		async execute() {
			session.selection = null;

			if (current_is_new) {
				await goto('/');
				return;
			}

			session = create_session(JSON.parse(initial_doc_json));
			this.context.editable = false;
		}
	}

	class SaveCommand extends Command {
		is_enabled() {
			return this.context.editable;
		}

		async execute() {
			if (!has_backend) {
				console.log('Document saved', session.to_json());
				session.selection = null;
				this.context.editable = false;
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

				/** @type {{ ok: boolean, document_id?: string, created?: boolean }} */
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

				if (result?.created && result.document_id) {
					try {
						await get_document(result.document_id);
						current_is_new = false;
						invalidate_page_browser_data();
						await goto(`/${result.document_id}`, { replaceState: true });
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

	const app_commands = {
		edit_document: new EditCommand(app_command_context),
		cancel_editing: new CancelCommand(app_command_context),
		save_document: new SaveCommand(app_command_context)
	};

	const app_key_map = define_keymap({
		'meta+escape,ctrl+escape': [app_commands.cancel_editing],
		'meta+e,ctrl+e': [app_commands.edit_document],
		'meta+s,ctrl+s': [app_commands.save_document]
	});
	key_mapper.push_scope(app_key_map);

	let session = $state(create_session(initial_doc));

	$effect(() => {
		if (!current_is_new) return;
		session = create_session(initial_doc);
	});
</script>

<svelte:window onkeydown={key_mapper.handle_keydown.bind(key_mapper)} />

<div class="demo-wrapper antialiased" bind:this={app_el}>
	<Toolbar {session} {app_commands} {editable} {focus_canvas} />
	<Svedit {session} bind:editable bind:this={svedit_ref} path={[session.doc.document_id]} />
	{#if has_backend}
		<SaveProgressModal
			visible={save_progress_visible}
			message={save_progress_message}
			done={save_progress_done}
		/>
	{/if}
</div>