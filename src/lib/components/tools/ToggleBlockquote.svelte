<script>
  import { classNames } from '$lib/util';
  import { wrapIn } from 'prosemirror-commands';

  export let editorView;
  export let editorState;

  $: schema = editorState.schema;
  $: disabled = !wrapIn(schema.nodes.blockquote)(editorView.state);

  function handleClick() {
    wrapIn(schema.nodes.blockquote)(editorState, editorView.dispatch);
    editorView.focus();
  }
</script>

<button
  on:click={handleClick}
  {disabled}
  class={classNames('disabled:opacity-30 rounded-full sm:mx-1 p-2 hover:bg-gray-100')}
>
  <slot />
</button>
