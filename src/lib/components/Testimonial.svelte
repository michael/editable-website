<script>
  import PlainText from './PlainText.svelte';
  import { classNames } from '$lib/util';
  import Image from './Image.svelte';
  import { createEventDispatcher } from 'svelte';
  import { isEditing } from '$lib/stores.js';

  const dispatch = createEventDispatcher();

  export let testimonial;
  export let firstEntry = false;
  export let lastEntry = false;
</script>

<div class={classNames(firstEntry ? 'pt-2 pb-8 sm:pb-12' : 'py-8 sm:py-12')}>
  <div class="max-w-screen-md mx-auto px-6 flex space-x-6 sm:space-x-8 relative">
    <div class="flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 overflow-hidden relative rounded-full">
      <Image
        class="rounded-full"
        maxWidth={160}
        maxHeight={160}
        quality={0.8}
        bind:src={testimonial.image}
        alt={testimonial.name}
      />
    </div>
    <div class="flex-1">
      <div class="text-lg sm:text-2xl italic">
        <PlainText bind:content={testimonial.text} />
      </div>
      <div class="mt-4 md:text-xl font-medium">
        <PlainText bind:content={testimonial.name} />
      </div>
    </div>
    {#if $isEditing}
      <div class="space-y-2 flex flex-col">
        <button
          class="w-6 h-6 p-1 rounded-full bg-gray-900 hover:bg-gray-800 text-white"
          on:click={() => dispatch('delete')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          class={classNames(
            'w-6 h-6 p-1 rounded-full hover:bg-gray-100',
            firstEntry ? 'opacity-20' : ''
          )}
          on:click={() => dispatch('up')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
        <button
          class={classNames(
            'w-6 h-6 p-1 rounded-full hover:bg-gray-100',
            lastEntry ? 'opacity-20' : ''
          )}
          on:click={() => dispatch('down')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
    {/if}
  </div>
</div>
