<script>
	import { TextProperty } from 'svedit';
	let { path, tag = 'h2', placeholder = 'Heading 1', class: css_class = '' } = $props();
</script>

<TextProperty
	{tag}
	class="{css_class} ew-display text-4xl tracking-tight text-balance lg:text-5xl"
	{path}
	{placeholder}
/>
