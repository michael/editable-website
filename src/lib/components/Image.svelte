<script>
  import { isEditing } from '$lib/stores.js';

  export let src;
  export let alt;
  export let uploadPrompt = undefined;
  export let maxWidth;
  export let maxHeight;
  export let quality;
  let className = '';
  let previewSrc;
  export { className as class };
</script>

{#if $isEditing}
  {#await import('./ImageEditor.svelte')}
    <img class={className} src={previewSrc || src} {alt} />
  {:then ImageEditor}
    <ImageEditor.default
      class={className}
      bind:src
      bind:previewSrc
      {alt}
      {uploadPrompt}
      {maxWidth}
      {maxHeight}
      {quality}
    />
  {/await}
{:else}
  <img width={maxWidth} height={maxHeight} class={className} {src} {alt} />
{/if}
