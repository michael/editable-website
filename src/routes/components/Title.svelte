<script>
	import { AnnotatedTextProperty } from 'svedit';

	let { path, tag = 'h3', placeholder = 'Heading 3', class: css_class = '' } = $props();
</script>

<AnnotatedTextProperty
	{tag}
	class="{css_class} ew-title tracking-tight text-2xl lg:text-3xl text-balance"
	{path}
	{placeholder}
/>
