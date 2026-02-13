<script>
	import { getContext } from 'svelte';
	const svedit = getContext('svedit');
	let { path, content } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<span
	id={node.id}
	data-node-id={node.id}
	class="highlight-mark text-inherit"
	style="anchor-name: --{path.join('-')};">{content}</span>

<style>
	.highlight-mark {
		background: linear-gradient(
			to bottom,
			transparent 38%,
			var(--accent-light) 38%,
			var(--accent-light) 82%,
			transparent 82%
		);
		text-decoration: none;
		/*box-decoration-break: clone;
		-webkit-box-decoration-break: clone;*/
	}
</style>
