<script>
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
  {#await import('./ImageEditor.svelte')}
    <img class={className} {src} {alt} />
  {:then ImageEditor}
    <ImageEditor.default
      {currentUser}
      class={className}
      bind:src
      {alt}
      {maxWidth}
      {maxHeight}
      {quality}
    />
  {/await}
{:else}
  <img class={className} {src} {alt} />
{/if}
