<script>
	import { setContext } from 'svelte';
	import { page } from '$app/stores';
	import { Svedit, KeyMapper, Command, define_keymap } from 'svedit';
	import { create_session } from './create_session.js';
	import { demo_doc } from '$lib/demo_doc.js';

	let { data } = $props();
	let session = $derived(create_session(demo_doc));

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
			// TODO: persist changes to database
			// await save_document(this.context.session);
			console.log('Document saved', session.to_json());
			session.selection = null;
			this.context.editable = false;
		}
	}

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

	// Create KeyMapper and provide via context
	const key_mapper = new KeyMapper();
	setContext('key_mapper', key_mapper);

	// Push app-level keymap scope
	const app_key_map = define_keymap({
		'meta+e,ctrl+e': [app_commands.edit_document],
		'meta+s,ctrl+s': [app_commands.save_document]
	});
	key_mapper.push_scope(app_key_map);
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
