<script>
  export let editable;
  export let content;
  export let multiLine = false;
</script>

{#if editable}
  {#await import('./RichTextEditor.svelte')}
    {@html content}
  {:then RichTextEditor}
    <RichTextEditor.default {multiLine} bind:content />
  {/await}
{:else}
  <div>
    {@html content}
  </div>
{/if}
