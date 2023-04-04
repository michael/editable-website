<script>
  import Limiter from '$lib/components/Limiter.svelte';
  export let form;
</script>

<Limiter>
  <div class="pt-20">
    {#if form?.incorrect}
      <p class="p-4 bg-red-100 text-red-600 my-4 rounded-md">Error while signing out.</p>
    {:else}
      Successfully logged out. <a class="underline" href="/">Continue</a>.
    {/if}
  </div>
</Limiter>
