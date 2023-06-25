<script>
  import { onMount, onDestroy } from 'svelte';
  import { toHTML, fromHTML } from '$lib/editor/prosemirrorUtil';
  import {
    singleLineRichTextSchema,
    multiLineRichTextSchema
  } from '$lib/editor/prosemirrorSchemas.js';
  import { activeEditorView } from '$lib/stores';
  import { EditorState, Plugin } from 'prosemirror-state';
  import { EditorView } from 'prosemirror-view';
  import { history } from 'prosemirror-history';
  import { keymap } from 'prosemirror-keymap';
  import { baseKeymap } from 'prosemirror-commands';
  import { buildKeymap } from '$lib/editor/prosemirrorKeymap';
  import { buildInputRules } from '$lib/editor/prosemirrorInputrules';

  export let content = '<p>Enter text.</p>';
  export let multiLine = false;
  let editorChange = false;
  let prosemirrorNode, editorView, editorState;

  $: schema = multiLine ? multiLineRichTextSchema : singleLineRichTextSchema;
  $: {
    const doc = fromHTML(schema, content);
    editorState = EditorState.create({
      doc,
      schema,
      plugins: [
        buildInputRules(schema),
        keymap(buildKeymap(schema)),
        keymap(baseKeymap),
        history(),
        onUpdatePlugin
      ]
    });
    // Only if there is already an editorView and the content change was external
    // update editorView with the new editorState
    if (!editorChange) {
      editorView?.updateState(editorState);
    } else {
      editorChange = false;
    }
  }

  function dispatchTransaction(transaction) {
    const editorState = this.state.apply(transaction);
    this.updateState(editorState);
    if (transaction.docChanged) {
      content = toHTML(editorState);
      // Leave a hint so we know the last content update came
      // from the editor (not the parent)
      editorChange = true;
    }
    this.state = editorState;
  }

  const onUpdatePlugin = new Plugin({
    view() {
      return {
        update(updatedView) {
          activeEditorView.set(updatedView);
        }
      };
    }
  });

  onMount(() => {
    editorView = new EditorView(prosemirrorNode, {
      state: editorState,
      dispatchTransaction
    });
    activeEditorView.set(editorView);
  });
  onDestroy(() => {
    // Guard on server side
    if (editorView) {
      editorView.destroy();
    }
  });
</script>

<div id="prosemirror-editor" bind:this={prosemirrorNode} />

<style>
  :global(#prosemirror-editor .ProseMirror) {
    outline: none;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
</style>
