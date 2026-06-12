<script>
	import { AnnotatedTextProperty } from 'svedit';
	let { path, tag = 'h2', placeholder = 'Heading 1', class: css_class = '' } = $props();
</script>

<AnnotatedTextProperty
	{tag}
	class="{css_class} ew-display tracking-tight text-4xl lg:text-5xl text-balance"
	{path}
	{placeholder}
/>
