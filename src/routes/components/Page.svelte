<script>
  import { Node, NodeArrayProperty } from 'svedit';
  import Nav from './Nav.svelte';
  import Footer from './Footer.svelte';

  let { path } = $props();
</script>

<Node {path}>
  <div class="page min-h-screen flex flex-col">
  	<Nav path={[...path, 'nav']}/>
   	<div class="grow">
    	<NodeArrayProperty class="body-node-array" path={[...path, 'body']} />
    </div>

    <Footer path={[...path, 'footer']}/>
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
