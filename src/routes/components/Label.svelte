<script>
	import { AnnotatedTextProperty } from 'svedit';
	let { path, tag = 'span', placeholder = 'Label', class: css_class = '' } = $props();
</script>

<AnnotatedTextProperty
	{tag}
	class="{css_class} ew-label leading-loose block text-xs md:text-sm uppercase tracking-widest text-[color-mix(in_oklch,var(--foreground)_60%,transparent)]"
	{path}
	{placeholder}
/>
