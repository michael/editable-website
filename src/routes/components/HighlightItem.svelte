<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';
	const svedit = getContext('svedit');

	let { path } = $props();
</script>

<Node
	tag="li"
	class="highlights-item w-full border-b border-(--border-color) pb-2 md:w-[calc(50%-1rem)]"
	{path}
>
	<div class="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
		<AnnotatedTextProperty
			tag="span"
			class="text-(--foreground)"
			path={[...path, 'label']}
			placeholder={svedit.editable ? 'Label' : undefined}
		/>
		<AnnotatedTextProperty
			tag="span"
			class="text-(--foreground)"
			path={[...path, 'value']}
			placeholder={svedit.editable ? 'Value' : undefined}
		/>
	</div>
</Node>
