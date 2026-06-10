<script>
	import { AnnotatedTextProperty } from 'svedit';
	let { path, tag = 'h2', placeholder = 'Heading 1', class: css_class = '' } = $props();
</script>

<AnnotatedTextProperty
	{tag}
	class="{css_class} ew-display text-3xl md:text-4xl lg:text-5xl text-balance text-(--foreground)"
	{path}
	{placeholder}
/>
