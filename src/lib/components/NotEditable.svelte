<script>
  import { classNames } from '$lib/util';
  import { isEditing } from '$lib/stores.js';
</script>

<div class={classNames($isEditing ? 'opacity-25 cursor-not-allowed relative' : '')}>
  {#if $isEditing}
    <div class="absolute inset-0 z-50" />
  {/if}
  <slot />
</div>
