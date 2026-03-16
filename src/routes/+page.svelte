<script>
	import { setContext } from 'svelte';
	import { page } from '$app/stores';
	import { Svedit, KeyMapper, Command, define_keymap } from 'svedit';
	import { create_session } from './create_session.js';
	import { get_document, save_document } from '$lib/api.remote.js';
	import {
		collect_blob_urls,
		wait_for_processing,
		has_pending_processing,
		upload_pending,
		replace_blob_urls,
		cleanup_pending
	} from '$lib/client/asset-upload.js';

	let app_el = $state();
	let svedit_ref = $state();
	let editable = $state(false);

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
			const doc_json = session.to_json();
			try {
				const blob_urls = collect_blob_urls(doc_json.nodes);

				if (blob_urls.length > 0) {
					// Wait for any images still being processed in the background
					if (has_pending_processing()) {
						console.log('Waiting for image processing to finish...');
						await wait_for_processing();
					}

					// Upload pending assets referenced in the document
					const mapping = await upload_pending(blob_urls);

					// Replace blob URLs with asset ids in the document
					replace_blob_urls(doc_json.nodes, mapping);

					// Clean up the pending map
					cleanup_pending(mapping);
				}

				await save_document(doc_json);
				console.log('Document saved');
				session.selection = null;
				this.context.editable = false;
			} catch (err) {
				console.error('Save failed:', err);
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

	// Load document from database (must be after all synchronous init)
	const doc = await get_document('page_1');
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
		<!-- <Toolbar {session} {focus_canvas} bind:editable /> -->
		<Svedit {session} bind:editable bind:this={svedit_ref} path={[session.doc.document_id]} />

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