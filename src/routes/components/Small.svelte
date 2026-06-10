<script>
	import { AnnotatedTextProperty } from 'svedit';

	let { path, tag = 'p', placeholder = 'Small', class: css_class = '' } = $props();
</script>

<AnnotatedTextProperty
	{tag}
	class="{css_class} ew-small leading-6 text-xs md:text-sm text-balance"
	{path}
	{placeholder}
/>
