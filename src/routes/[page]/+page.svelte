<script>
	import { setContext } from 'svelte';
	import { page } from '$app/state';
	import { Svedit, KeyMapper, Command, define_keymap } from 'svedit';
	import { create_session } from '../create_session.js';
	let { data } = $props();
	let session = $derived(create_session(data.doc));

	let app_el;
	let svedit_ref;
	let editable = $state(true);

	function focus_canvas() {
		if (svedit_ref) {
			svedit_ref.focus_canvas();
		}
	}

	class EditCommand extends Command {
		is_enabled() {
			// Disabled if edit mode is already on
			return !this.context.editable;
		}

		execute() {
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
	<title>Editable Website v2</title>
</svelte:head>

{#key page.url.pathname}
	<div class="demo-wrapper" bind:this={app_el}>
		<!-- <Toolbar {session} {focus_canvas} bind:editable /> -->
		<Svedit {session} bind:editable bind:this={svedit_ref} path={[session.doc.document_id]} />

		{#if editable}
			<div class="flex-column mx-auto my-10 w-full max-w-5xl gap-y-2">
				<p>Selection:</p>
				<pre class="debug-info p-4">{JSON.stringify(session.selection || {}, null, '  ')}</pre>
				<p>Nodes:</p>
				<pre class="debug-info p-4">{JSON.stringify(session.to_json(), null, '  ')}</pre>
			</div>
		{/if}
	</div>
{/key}

<style>
	.debug-info {
		text-wrap: wrap;
		height: 12lh;
		overflow-y: auto;
		color: white;
		background: var(--primary-fill-color);
		font-size: 12px;
	}
</style>
