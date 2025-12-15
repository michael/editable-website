<script>
	import { getContext } from 'svelte';
	import { AnnotatedTextProperty, NodeArrayProperty, Node } from 'svedit';
	const svedit = getContext('svedit');

	let { path } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<Node {path}>
	<div class="footer relative mx-3 flex px-4 py-12 sm:px-6 md:mx-8 lg:mx-12">
		<div
			class="mx-auto grid w-full grid-cols-1 gap-6 md:max-w-5xl md:grid-cols-4 md:gap-8 lg:grid-cols-6"
		>
			<!-- Copyright column -->
			<AnnotatedTextProperty
				class="col-span-1 flex-col gap-4 sm:col-span-2"
				path={[...path, 'copyright']}
				placeholder="Copyright"
			/>

			<!-- Link columns wrapper using subgrid -->
			<NodeArrayProperty
				class="[--layout-orientation:vertical] md:[--layout-orientation:horizontal] link-columns grid grid-cols-subgrid col-span-1 md:col-span-2 lg:col-span-4 gap-6 lg:gap-8"
				path={[...path, 'footer_link_columns']}
			/>
		</div>
	</div>
</Node>
