<script>
  import { classNames } from '$lib/util';
  export let noPadding = false;
</script>

<div class={classNames('max-w-lg mx-auto', noPadding ? '' : 'px-4')}>
  <slot />
</div>
