<script>
  import { classNames } from '$lib/util';
  import { anythingSelected } from '$lib/prosemirrorCommands.js';

  export let editorView;
  export let editorState;
  export let isPromptOpen;
  $: disabled = !anythingSelected(editorState);

  $: schema = editorState.schema;

  function handleClick() {
    isPromptOpen = !isPromptOpen;
    editorView.focus();
  }
</script>

<button
  on:click={handleClick}
  {disabled}
  class={classNames(
    isPromptOpen ? 'bg-gray-900 text-white' : 'hover:bg-gray-100',
    'sm:mx-1 rounded-full p-2 disabled:opacity-30'
  )}
>
  <slot />
</button>
