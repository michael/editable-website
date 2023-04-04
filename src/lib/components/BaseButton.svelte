<script>
  import { classNames } from '$lib/util';
  export let styles;
  export let size = 'default';
  export let type = 'button';
  export let href = undefined;
  export let disabled = false;
  const STYLE_SHARED =
    'm-0 p-0 disabled:cursor-not-allowed disabled:opacity-50 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 font-sans no-underline text-center';
  const STYLE_SIZES = {
    sm: `px-4 py-2 text-sm sm:text-base sm:px-4 sm:py-1`,
    default: `px-4 py-2 text-sm sm:text-base sm:px-5 sm:py-3`,
    lg: `px-8 sm:px-12 py-3 text-base sm:py-4 sm:text-xl`
  };
  $: className = classNames(styles, STYLE_SHARED, STYLE_SIZES[size], disabled ? 'disabled' : '');
</script>

{#if href}
  <a {href} class={className} {disabled}>
    <slot />
  </a>
{:else}
  <button {type} class={className} {disabled} on:click>
    <slot />
  </button>
{/if}
