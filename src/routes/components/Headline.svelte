<script>
	import { AnnotatedTextProperty } from 'svedit';

	let { path, tag = 'h2', placeholder = 'Heading 2', class: css_class = '' } = $props();
</script>

<AnnotatedTextProperty
	{tag}
	class="{css_class} ew-headline font-serif text-2xl md:text-3xl lg:text-4xl text-balance text-(--foreground)"
	{path}
	{placeholder}
/>
