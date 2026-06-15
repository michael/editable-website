<script>
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import { serialize_path } from 'svedit';
	const svedit = getContext('svedit');
	let { path, content } = $props();
	let node = $derived(svedit.session.get(path));

	function get_link_href(href) {
		if (!href) return undefined;
		return href.startsWith('/') ? resolve(href) : href;
	}
</script>

<a
	id={node.id}
	data-node-id={node.id}
	{...{ href: get_link_href(node?.href), target: node?.target || '_self' }}
	class="underline underline-offset-2 transition-all duration-500 ease-in-out decoration-(--foreground)/15 hover:decoration-(--foreground) hover:text-(--foreground) outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1"
	style="anchor-name: --{serialize_path(path)};">{content}</a
>
