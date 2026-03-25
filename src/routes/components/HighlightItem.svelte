<script>
	import { Node, AnnotatedTextProperty } from 'svedit';

	let { path } = $props();
</script>

<Node
	tag="li"
	class="highlights-item w-full border-b border-(--foreground) pb-2 md:w-[calc(50%-1rem)]"
	{path}
>
	<div class="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
		<AnnotatedTextProperty
			tag="strong"
			class="text-(--foreground)"
			path={[...path, 'label']}
			placeholder="Label"
		/>
		<AnnotatedTextProperty
			tag="span"
			class="text-(--foreground)"
			path={[...path, 'value']}
			placeholder="Value"
		/>
	</div>
</Node>
