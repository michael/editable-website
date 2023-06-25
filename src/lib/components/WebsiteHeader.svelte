<script>
  import WebsiteNav from '$lib/components/WebsiteNav.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import EditorToolbar from '$lib/components/tools/EditorToolbar.svelte';
  import { createEventDispatcher } from 'svelte';

  export let showUserMenu = false;
  const dispatch = createEventDispatcher();
</script>

<EditorToolbar on:cancel={() => dispatch('cancel')} on:save={() => dispatch('save')} />
<WebsiteNav bind:showUserMenu />
{#if showUserMenu}
  <Modal on:close={() => (showUserMenu = false)}>
    <div class="w-full flex flex-col space-y-4 p-4 sm:p-6">
      <slot />
    </div>
  </Modal>
{/if}
