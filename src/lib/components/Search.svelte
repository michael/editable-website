<script>
  import { onMount } from 'svelte';
  import { debounce, classNames } from '$lib/util';
  import { SHORTCUTS } from '$lib/constants';
  import { goto } from '$app/navigation';

  export let showSearch;
  let value;
  let result = SHORTCUTS;
  let selectedResult = 0;
  let input;
  let resultsEl;

  onMount(() => {
    input.focus();
  });

  async function search() {
    if (value) {
      const response = await fetch(`/api/search?q=${value}`);
      result = await response.json();
    } else {
      result = SHORTCUTS;
    }
    selectedResult = 0;
  }

  function navigate() {
    const currentResult = result[selectedResult];
    if (currentResult) {
      goto(currentResult.url);
    }
    showSearch = false;
  }

  function prevResult() {
    if (selectedResult > 0) {
      selectedResult -= 1;
    }
    scrollIntoViewIfNeeded();
  }

  function nextResult() {
    if (selectedResult < result.length - 1) {
      selectedResult += 1;
    }
    scrollIntoViewIfNeeded();
  }

  function scrollIntoViewIfNeeded() {
    let node = resultsEl.childNodes[selectedResult];
    if (node.scrollIntoViewIfNeeded) {
      node.scrollIntoViewIfNeeded();
    }
  }

  function onKeyDown(e) {
    switch (e.keyCode) {
      case 38: // up
        prevResult();
        e.preventDefault();
        break;
      case 40: // down
        nextResult();
        e.preventDefault();
        break;
      case 13:
        navigate();
        break;
    }
  }
</script>

<div class="relative border-b border-gray-100 flex space-x-4 items-center px-4 sm:px-6 py-2">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="w-6 h-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
  <input
    bind:this={input}
    bind:value
    use:debounce={{ value, func: search, duration: 50 }}
    autocomplete="off"
    id="search"
    name="search"
    class="block w-full border-none bg-transparent px-0 py-2 placeholder-gray-300 focus:border-black focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-0"
    placeholder="Search website ..."
    type="text"
  />
  <button
    class="bg-gray-100 rounded-md px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900"
    on:click={() => (showSearch = false)}>ESC</button
  >
</div>

{#if result.length > 0}
  <div class="font-bold text-sm px-4 sm:px-6 py-4 border-b border-gray-100">
    {value ? 'BEST MATCHES' : 'SHORTCUTS'}
  </div>
{/if}
<div class="overflow-y-auto" bind:this={resultsEl}>
  {#each result as item, i}
    <a
      on:click={() => (showSearch = false)}
      class={classNames(
        'block px-4 sm:px-6 py-3 border-b border-gray-100 text-gray-600 hover:text-black',
        selectedResult === i ? 'bg-gray-100' : ''
      )}
      href={item.url}>{item.name}</a
    >
  {/each}
</div>

<svelte:window on:keydown={onKeyDown} />
