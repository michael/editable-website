<script>
  import { goto } from '$app/navigation';
  import PrimaryButton from './PrimaryButton.svelte';
  import { currentUser } from '$lib/stores.js';
</script>

<div>
  <div class="py-4 text-center">Signed in as {$currentUser.name}</div>
  <div class="flex flex-col">
    <PrimaryButton on:click={() => goto('/logout')}>Sign out</PrimaryButton>
  </div>
</div>
