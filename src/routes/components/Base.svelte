<script>
	import { AnnotatedTextProperty } from 'svedit';

	let { path, tag = 'p', placeholder = 'Paragraph', class: css_class = '' } = $props();
</script>

<AnnotatedTextProperty
	{tag}
	class={css_class}
	{path}
	{placeholder}
/>
