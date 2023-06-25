<script>
  import { classNames } from '$lib/util';
  import { setBlockType } from 'prosemirror-commands';
  import { blockTypeActive } from '$lib/editor/prosemirrorUtil';

  export let editorView;
  export let editorState;

  $: schema = editorState.schema;
  $: disabled =
    !setBlockType(schema.nodes.heading)(editorState) &&
    !setBlockType(schema.nodes.paragraph)(editorState);
  $: active = blockTypeActive(schema.nodes.heading, { level: 1 })(editorState);

  function handleClick() {
    if (active) {
      setBlockType(schema.nodes.paragraph)(editorState, editorView.dispatch);
    } else {
      setBlockType(schema.nodes.heading, { level: 1 })(editorState, editorView.dispatch);
    }
    editorView.focus();
  }
</script>

<button
  on:click={handleClick}
  {disabled}
  class={classNames(
    active ? 'bg-gray-900 text-white' : 'hover:bg-gray-100',
    'sm:mx-1 rounded-full p-2 disabled:opacity-30'
  )}
>
  <slot />
</button>
