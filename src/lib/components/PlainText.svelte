<script>
  import PlainTextEditor from './PlainTextEditor.svelte';

  export let editable;
  export let content;
  export let multiLine = false;
</script>

{#if editable}
  <PlainTextEditor bind:content {multiLine} />
{:else}
  {@html content}
{/if}
