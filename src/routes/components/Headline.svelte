<script>
	import { AnnotatedTextProperty } from 'svedit';

	let { path, tag = 'h2', placeholder = 'Heading 2', class: css_class = '' } = $props();
</script>

<AnnotatedTextProperty
	{tag}
	class="{css_class} ew-headline tracking-tight text-3xl lg:text-4xl text-balance"
	{path}
	{placeholder}
/>
