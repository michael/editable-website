<script>
  import ImageEditor from './ImageEditor.svelte';

  export let editable;
  export let currentUser;
  export let src;
  export let alt;
  export let maxWidth;
  export let maxHeight;
  export let quality;
  let className = '';
  export { className as class };
</script>

{#if editable}
  <ImageEditor {currentUser} class={className} bind:src {alt} {maxWidth} {maxHeight} {quality} />
{:else}
  <img class={className} {src} {alt} />
{/if}
