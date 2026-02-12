<script>
  import { getContext } from 'svelte';
  import { Node, NodeArrayProperty } from 'svedit';
  import Nav from './Nav.svelte';
  import Footer from './Footer.svelte';

  const svedit = getContext('svedit');
  let { path } = $props();
  let node = $derived(svedit.session.get(path));
  let first_body_node_id = $derived(node.body?.[0]);
  let first_body_node = $derived(first_body_node_id ? svedit.session.get([first_body_node_id]) : null);
  let nav_colorset_class = $derived(first_body_node?.colorset ? `ew-colorset-${first_body_node.colorset}` : '');

  let last_body_node_id = $derived(node.body?.[node.body.length - 1]);
  let last_body_node = $derived(last_body_node_id ? svedit.session.get([last_body_node_id]) : null);
  let footer_colorset_class = $derived(last_body_node?.colorset ? `ew-colorset-${last_body_node.colorset}` : '');
</script>

<Node {path}>
  <div class="page min-h-screen flex flex-col">
  	<div class="bg-(--background) text-(--foreground) {nav_colorset_class}">
  		<Nav path={[...path, 'nav']}/>
  	</div>
   	<div class="grow">
    	<NodeArrayProperty class="body-node-array" path={[...path, 'body']} />
    </div>

    <div class="bg-(--background) text-(--foreground) {footer_colorset_class}">
    	<Footer path={[...path, 'footer']}/>
    </div>
  </div>
</Node>

<style>
  :global {
    .body-node-array {
      display: grid;
      grid-template-columns: 1fr;
    }
  }
</style>
