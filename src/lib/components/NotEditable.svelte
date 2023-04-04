<script>
  import { classNames } from '$lib/util';

  export let editable;
</script>

<div class={classNames(editable ? 'opacity-25 cursor-not-allowed relative' : '')}>
  {#if editable}
    <div class="absolute inset-0 z-50" />
  {/if}
  <slot />
</div>
