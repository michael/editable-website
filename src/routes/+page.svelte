<script>
	import { setContext } from 'svelte';
	import { page } from '$app/stores';
	import { Svedit, KeyMapper, Command, define_keymap } from 'svedit';
	import Toolbar from './components/Toolbar.svelte';
	import { create_session } from './create_session.js';
	import { demo_doc } from '$lib/demo_doc.js';
	import SaveProgressModal from './components/SaveProgressModal.svelte';

	let { data } = $props();
	// svelte-ignore state_referenced_locally
	const has_backend = data.has_backend;

	let app_el = $state();
	let svedit_ref = $state();
	let editable = $state(false);

	// Save progress modal state
	let save_progress_visible = $state(false);
	let save_progress_message = $state('');
	let save_progress_done = $state(false);

	$effect(() => {
		document.documentElement.style.scrollBehavior = editable ? 'auto' : 'smooth';
	});

	function focus_canvas() {
		if (svedit_ref) {
			svedit_ref.focus_canvas();
		}
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
			// Disabled if edit mode is already on
			return !this.context.editable;
		}

		execute() {
			const browser_check = check_browser_support();
			if (!browser_check.supported) {
				alert(`Your browser (${browser_check.browser} ${browser_check.version}) may not fully support the editor. For the best experience, please upgrade to ${browser_check.browser} ${browser_check.required} or newer.`);
			}
			this.context.editable = true;
		}
	}

	class SaveCommand extends Command {
		is_enabled() {
			// Saving is only possible while edit mode is on
			return this.context.editable;
		}

		async execute() {
			if (!has_backend) {
				// Vercel demo mode — no persistence
				console.log('Document saved', session.to_json());
				session.selection = null;
				this.context.editable = false;
				return;
			}

			// Node backend — full save with asset upload
			const save_start = Date.now();

			// Dynamically import backend-dependent modules
			const [
				// @ts-ignore — TypeScript can't infer exports through command() wrapper
				{ save_document: persist_document },
				{
					collect_blob_urls,
					wait_for_processing,
					has_pending_processing,
					ensure_processing,
					upload_pending,
					replace_blob_urls,
					cleanup_pending
				}
			] = await Promise.all([
				import('$lib/api.remote.js'),
				import('$lib/client/asset_upload.js')
			]);

			// Start progress tracking (modal appears after 1s delay)
			save_progress_visible = true;
			save_progress_done = false;
			save_progress_message = 'Saving…';

			try {
				let mapping = null;

				// 1. Upload assets (before serializing the document)
				const pre_check = session.to_json();
				const blob_urls = collect_blob_urls(pre_check.nodes);

				if (blob_urls.length > 0) {
					const total = blob_urls.length;

					// Re-start processing for any blob URLs missing from the pending map
					// (e.g. after undo brought back blob URLs cleaned up by a previous save)
					await ensure_processing(blob_urls);

					// Wait for any images still being processed in the background
					if (has_pending_processing()) {
						save_progress_message = total === 1
							? 'Processing image…'
							: `Processing ${total} images…`;
						await wait_for_processing(({ done, total: t }) => {
							if (t > 1) {
								save_progress_message = `Processing image ${done + 1}/${t}…`;
							}
						});
					}

					// Upload pending assets referenced in the document
					mapping = await upload_pending(blob_urls, ({ phase, index, total: t }) => {
						if (phase === 'uploading') {
							save_progress_message = `Uploading image ${index}/${t}…`;
						}
					});
				}

				// 2. Replace blob URLs on the doc_json copy and save
				save_progress_message = 'Saving…';
				const doc_json = session.to_json();
				if (mapping) {
					replace_blob_urls(doc_json.nodes, mapping);
				}

				await persist_document(doc_json);

				// 3. Save succeeded — now update the live session and clean up
				if (mapping) {
					const tr = session.tr;
					for (const [blob_url, entry] of mapping.entries()) {
						for (const node of Object.values(pre_check.nodes)) {
							if (node.type === 'image' && node.src === blob_url) {
								tr.set([node.id, 'src'], entry.asset_id);
								tr.set([node.id, 'width'], entry.width);
								tr.set([node.id, 'height'], entry.height);
							}
						}
					}
					session.apply(tr);
					cleanup_pending(mapping);
				}

				console.log('Document saved');
				session.selection = null;
				this.context.editable = false;

				// Flash success message only if save took more than 3s
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

	// Create KeyMapper and provide via context (must happen synchronously before any await)
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
		save_document: new SaveCommand(app_command_context)
	};

	// Push app-level keymap scope
	const app_key_map = define_keymap({
		'meta+e,ctrl+e': [app_commands.edit_document],
		'meta+s,ctrl+s': [app_commands.save_document]
	});
	key_mapper.push_scope(app_key_map);

	// Load document: from database when backend is available, otherwise use demo_doc
	const doc = has_backend
		? await import('$lib/api.remote.js').then((m) => m.get_document('page_1'))
		: demo_doc;
	let session = $derived(create_session(doc));
</script>

<svelte:window onkeydown={key_mapper.handle_keydown.bind(key_mapper)} />

<svelte:head>
	<title>Editable Website</title>
</svelte:head>

<!--
	BUG: When navigating from / with preloading on the Svedit component ends up
	with a stale session, breaking editing.
	See https://github.com/michael/editable-website/issues/40
-->

<!-- Workaround for #40: Note that page.url.pathname from $app/state does not work -->
{#key $page.url.pathname}
	<div class="demo-wrapper antialiased" bind:this={app_el}>
		<Toolbar {session} {app_commands} {editable} {focus_canvas} />
		<Svedit {session} bind:editable bind:this={svedit_ref} path={[session.doc.document_id]} />
		{#if has_backend}
			<SaveProgressModal visible={save_progress_visible} message={save_progress_message} done={save_progress_done} />
		{/if}

		<!-- {#if editable}
			<div class="flex-column mx-auto my-10 w-full max-w-5xl gap-y-2">
				<p>Selection:</p>
				<pre tabindex="-1" class="debug-info p-4">{JSON.stringify(session.selection || {}, null, '  ')}</pre>
				<p>Nodes:</p>
				<pre tabindex="-1" class="debug-info p-4">{JSON.stringify(session.to_json(), null, '  ')}</pre>
			</div>
		{/if} -->
	</div>
{/key}

<style>
	/*.debug-info {
		text-wrap: wrap;
		height: 12lh;
		overflow-y: auto;
		color: white;
		background: var(--primary-fill-color);
		font-size: 12px;
	}*/
</style>
