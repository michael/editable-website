<script>
  import { isEditing } from '$lib/stores.js';
</script>

{#if $isEditing}
  {#await import('$lib/components/tools/EditorControls.svelte') then EditorToolbar}
    <EditorToolbar.default on:cancel on:save />
  {/await}
{/if}
