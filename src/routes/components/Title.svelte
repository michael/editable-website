<script>
	import { AnnotatedTextProperty } from 'svedit';

	let { path, tag = 'h3', placeholder = 'Heading 3', class: css_class = '' } = $props();
</script>

<AnnotatedTextProperty
	{tag}
	class="{css_class} ew-title text-lg md:text-xl lg:text-2xl text-balance text-(--foreground)"
	{path}
	{placeholder}
/>
