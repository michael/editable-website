<script>
  import RichTextEditor from './RichTextEditor.svelte';

  export let editable;
  export let content;
  export let multiLine = false;
</script>

{#if editable}
  <RichTextEditor {multiLine} bind:content />
{:else}
  <div>
    {@html content}
  </div>
{/if}
