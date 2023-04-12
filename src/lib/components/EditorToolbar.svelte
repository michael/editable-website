<script>
  export let currentUser;
</script>

{#await import('$lib/components/EditorControls.svelte') then EditorToolbar}
  <EditorToolbar.default {currentUser} on:cancel on:save />
{/await}
