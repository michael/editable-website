<script>
	import { AnnotatedTextProperty } from 'svedit';
	let { path, tag = 'p', placeholder = 'Lead', class: css_class = '' } = $props();
</script>

<AnnotatedTextProperty
	{tag}
	class="{css_class} ew-large font-sans text-xl text-balance text-(--foreground)"
	{path}
	{placeholder}
/>
