<script lang="ts">
	import type { Nodes } from '#app/document_schema.js';
	import type { DocumentPath } from 'svedit';
	import { get_svedit_context } from '#app/svedit_context.js';
	import { resolve } from '$app/paths';
	import type { PathnameWithSearchOrHash } from '$app/types';
	import { serialize_path } from 'svedit';
	const svedit = get_svedit_context();
	let { path, content }: { path: DocumentPath; content: string } = $props();
	let node: Nodes['link'] = $derived(svedit.session.get(path));

	function get_link_href(href) {
		if (!href) return undefined;
		if (!href.startsWith('/')) return href;
		if (href === '/') return resolve('/');
		return resolve(href.slice(1) as PathnameWithSearchOrHash);
	}
</script>

<a
	id={node.id}
	data-node-id={node.id}
	{...{ href: get_link_href(node?.href), target: node?.target || '_self' }}
	class="underline underline-offset-2 outline-1 outline-transparent transition-all duration-500 ease-in-out hover:text-(--foreground) hover:decoration-(--foreground) focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
	style="anchor-name: --{serialize_path(path)};">{content}</a
>
