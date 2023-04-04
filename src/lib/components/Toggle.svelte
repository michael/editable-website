<script>
  import { classNames } from '$lib/util';
  export let checked = false;
  export let size = 'default';
  $: className = classNames(
    'relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600',
    checked ? 'bg-indigo-600' : 'bg-slate-300',
    size === 'default' ? 'h-5 w-10' : 'w-8'
  );
  $: innerClassName = classNames(
    checked ? (size === 'default' ? 'translate-x-5' : 'translate-x-4') : 'translate-x-0',
    'pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
    size === 'default' ? 'h-4 w-4' : 'h-3 w-3'
  );
  function toggle() {
    checked = !checked;
  }
</script>

<div class="inline-flex items-center">
  <button class={className} on:click={toggle}>
    <div class={innerClassName} />
  </button>
  <div class="px-2"><slot /></div>
</div>
