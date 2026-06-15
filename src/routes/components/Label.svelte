<script>
	import { AnnotatedTextProperty } from 'svedit';
	let { path, tag = 'span', placeholder = 'Label', class: css_class = '' } = $props();
</script>

<AnnotatedTextProperty
	{tag}
	class="{css_class} ew-label leading-loose text-sm tracking-widest uppercase"
	{path}
	{placeholder}
/>
