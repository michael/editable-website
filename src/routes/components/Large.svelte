<script>
	import { AnnotatedTextProperty } from 'svedit';
	let { path, tag = 'p', placeholder = 'ParagraphLG', class: css_class = '' } = $props();
</script>

<AnnotatedTextProperty
	{tag}
	class="{css_class} ew-large font-sans text-xl lg:text-2xl text-balance text-(--foreground)"
	{path}
	{placeholder}
/>
