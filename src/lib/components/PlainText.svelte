<script>
  export let editable;
  export let content;
  export let multiLine = false;
</script>

{#if editable}
  {#await import('./PlainTextEditor.svelte')}
    {@html content}
  {:then PlainTextEditor}
    <PlainTextEditor.default {multiLine} bind:content />
  {/await}
{:else}
  {@html content}
{/if}
