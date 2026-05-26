<script>
	import { Node, NodeArrayProperty } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';

	let { path } = $props();
</script>

<Node class="h-full" {path}>
	<article class="flex h-full min-h-0 flex-col border border-(--foreground) bg-(--background) p-5 sm:p-6">
		<div class="aspect-4/3 w-full overflow-hidden bg-[color-mix(in_oklch,var(--foreground)_12%,transparent)]">
			<MediaProperty path={[...path, 'media']} />
		</div>

		<NodeArrayProperty
			class="[--row:0] mt-5 flex min-h-0 flex-1 flex-col gap-3"
			path={[...path, 'body']}
		/>

		<NodeArrayProperty
			class="[--row:0] mt-auto pt-5 [&_.ew-button]:w-full"
			path={[...path, 'buttons']}
		/>
	</article>
</Node>
