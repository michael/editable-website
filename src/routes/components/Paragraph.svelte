<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
</script>

{#snippet p()}
  <AnnotatedTextProperty
  	tag="p"
    path={[...path, 'content']}
    placeholder={"Paragraph"}
  />
{/snippet}

<!-- Left-aligned -->
{#snippet layout_1()}
	<div class="mx-auto max-w-7xl">
	  <div class="max-w-4xl px-15 py-4">
			{@render p()}
		</div>
	</div>
{/snippet}

<!-- Right-oriented -->
{#snippet layout_2()}
	<div class="mx-auto max-w-7xl grid grid-cols-3">
  	<div class="col-span-3 pl-20 pr-5 md:col-span-2 md:col-start-2 md:pr-15 md:pl-0">
   		{@render p()}
   	</div>
	</div>
{/snippet}

<!-- Centered -->
{#snippet layout_3()}
	<div class="mx-auto max-w-7xl">
  	<div class="mx-auto max-w-4xl text-center">
   		{@render p()}
   	</div>
	</div>
{/snippet}

<Node class="ew-paragraph" {path}>
  {@const layouts = [
    layout_1,
    layout_2,
    layout_3]}
  {@render layouts[node.layout - 1]()}
</Node>


<!-- <Node {path}>
	<div class="paragraph mx-auto w-full max-w-5xl px-3 py-3 sm:px-4">
		<AnnotatedTextProperty
			tag="p"
			class="text-base"
			path={[...path, 'content']}
			placeholder="Paragraph"
		/>
	</div>
</Node> -->
