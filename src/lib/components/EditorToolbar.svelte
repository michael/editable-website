<script>
  import { activeEditorView } from '$lib/stores';
  import { onDestroy } from 'svelte';
  import ToggleMark from './tools/ToggleMark.svelte';
  import ToggleBulletList from './tools/ToggleBulletList.svelte';
  import ToggleBlockquote from './tools/ToggleBlockquote.svelte';
  import ToggleOrderedList from './tools/ToggleOrderedList.svelte';
  import PrimaryButton from './PrimaryButton.svelte';
  import SecondaryButton from './SecondaryButton.svelte';
  import { createEventDispatcher } from 'svelte';
  import ToggleHeading from './tools/ToggleHeading.svelte';
  import InsertImage from './tools/InsertImage.svelte';
  import CreateLink from './tools/CreateLink.svelte';
  import ToggleAICompletion from '$lib/components/tools/ToggleAICompletion.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { fetchJSON } from '$lib/util.js';

  export let currentUser = undefined;

  let editorView = null;
  let editorState = null;
  let isPromptOpen = false;

  const unsubscribe = activeEditorView.subscribe(value => {
    editorView = value;
    editorState = value?.state;
  });

  const dispatch = createEventDispatcher();

  function handleCancel() {
    dispatch('cancel', {});
  }

  function handleSave() {
    dispatch('save', {});
  }

  onDestroy(unsubscribe);

  function onKeyDown(e) {
    // Trigger save
    if (e.key === 's' && e.metaKey) {
      dispatch('save', {});
      e.preventDefault();
      e.stopPropagation();
    }
  }

  let prompt = '';
  let generating;
  async function onGeneratePrompt() {
    const existingText = editorState.doc.textBetween(
      editorState.selection.from,
      editorState.selection.to
    );
    const result = await fetchJSON('POST', `/api/generate`, {
      prompt,
      existingText
    });
    const { tr } = editorView.state;
    tr.replaceSelectionWith(editorView.state.schema.text(result), true);
    editorView.dispatch(tr);
  }
</script>

{#if isPromptOpen}
  <Modal
    on:close={() => {
      editorView.focus();
      isPromptOpen = false;
    }}
  >
    <div class="flex flex-col p-4">
      <h2 class="text-lg font-medium text-gray-900">Generate AI text</h2>
      <p class="my-4 text-sm text-gray-500">
        The current selected text will be replaced:
        {#if editorState}
          <strong>
            {editorState.doc.textBetween(editorState.selection.from, editorState.selection.to)}
          </strong>
        {/if}
      </p>
      <label for="prompt" class="font-medium text-gray-700">What would you like to generate?</label>
      <div class="mt-1">
        <input
          type="text"
          name="prompt"
          id="prompt"
          class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md h-10"
          bind:value={prompt}
        />
      </div>
      <div class="mt-4 flex items-center">
        <PrimaryButton
          on:click={async () => {
            editorView.focus();
            generating = onGeneratePrompt();
            await generating;
            isPromptOpen = false;
            prompt = '';
          }}>Generate</PrimaryButton
        >
        {#await generating}
          <!-- a tailwind spinner -->
          <div
            class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900 ml-4"
          />
        {/await}
      </div>
    </div>
  </Modal>
{/if}

<div class="sticky top-0 z-10 sm:py-4 sm:px-4">
  <div
    class="max-w-screen-lg mx-auto px-2 backdrop-blur-sm bg-white bg-opacity-95 border-b border-t sm:border sm:rounded-full border-gray-100 shadow"
  >
    <div>
      <div class="flex items-center overflow-x-auto py-3 px-1">
        {#if editorState}
          <div class="flex">
            <ToggleMark {editorState} {editorView} type="strong">
              <svg
                class="h-3 w-3 sm:h-4 sm:w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                stroke="currentColor"
                viewBox="0 0 384 512"
                ><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
                  d="M0 64C0 46.3 14.3 32 32 32H80 96 224c70.7 0 128 57.3 128 128c0 31.3-11.3 60.1-30 82.3c37.1 22.4 62 63.1 62 109.7c0 70.7-57.3 128-128 128H96 80 32c-17.7 0-32-14.3-32-32s14.3-32 32-32H48V256 96H32C14.3 96 0 81.7 0 64zM224 224c35.3 0 64-28.7 64-64s-28.7-64-64-64H112V224H224zM112 288V416H256c35.3 0 64-28.7 64-64s-28.7-64-64-64H224 112z"
                /></svg
              >
            </ToggleMark>
            <ToggleMark {editorState} {editorView} type="em">
              <svg
                class="h-3 w-3 sm:h-4 sm:w-4"
                fill="currentColor"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
                ><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
                  d="M128 64c0-17.7 14.3-32 32-32H352c17.7 0 32 14.3 32 32s-14.3 32-32 32H293.3L160 416h64c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H90.7L224 96H160c-17.7 0-32-14.3-32-32z"
                /></svg
              >
            </ToggleMark>
            <CreateLink {editorState} {editorView}>
              <svg
                class="h-3 w-3 sm:h-4 sm:w-4"
                fill="currentColor"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
                ><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
                  d="M562.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L405.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C189.5 251.2 196 330 246 380c56.5 56.5 148 56.5 204.5 0L562.8 267.7zM43.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C57 372 57 321 88.5 289.5L200.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C416.5 260.8 410 182 360 132c-56.5-56.5-148-56.5-204.5 0L43.2 244.3z"
                /></svg
              >
            </CreateLink>
            <div class="hidden sm:block w-px bg-gray-300 mx-3" />
            <ToggleHeading {editorState} {editorView}>
              <svg
                class="h-3 w-3 sm:h-4 sm:w-4"
                fill="currentColor"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                ><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
                  d="M0 64C0 46.3 14.3 32 32 32H80h48c17.7 0 32 14.3 32 32s-14.3 32-32 32H112V208H336V96H320c-17.7 0-32-14.3-32-32s14.3-32 32-32h48 48c17.7 0 32 14.3 32 32s-14.3 32-32 32H400V240 416h16c17.7 0 32 14.3 32 32s-14.3 32-32 32H368 320c-17.7 0-32-14.3-32-32s14.3-32 32-32h16V272H112V416h16c17.7 0 32 14.3 32 32s-14.3 32-32 32H80 32c-17.7 0-32-14.3-32-32s14.3-32 32-32H48V240 96H32C14.3 96 0 81.7 0 64z"
                /></svg
              >
            </ToggleHeading>
            <ToggleBlockquote {editorState} {editorView}>
              <svg
                class="h-3 w-3 sm:h-4 sm:w-4"
                fill="currentColor"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                ><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
                  d="M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320 288 216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H320c-35.3 0-64-28.7-64-64V320 288 216z"
                /></svg
              >
            </ToggleBlockquote>
            <div class="hidden sm:block w-px bg-gray-300 mx-3" />
            <ToggleBulletList {editorState} {editorView}>
              <svg
                class="h-3 w-3 sm:h-4 sm:w-4"
                fill="currentColor"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                ><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
                  d="M64 144a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM64 464a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm48-208a48 48 0 1 0 -96 0 48 48 0 1 0 96 0z"
                /></svg
              >
            </ToggleBulletList>
            <ToggleOrderedList {editorState} {editorView}>
              <svg
                class="h-3 w-3 sm:h-4 sm:w-4"
                fill="currentColor"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                ><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
                  d="M24 56c0-13.3 10.7-24 24-24H80c13.3 0 24 10.7 24 24V176h16c13.3 0 24 10.7 24 24s-10.7 24-24 24H40c-13.3 0-24-10.7-24-24s10.7-24 24-24H56V80H48C34.7 80 24 69.3 24 56zM86.7 341.2c-6.5-7.4-18.3-6.9-24 1.2L51.5 357.9c-7.7 10.8-22.7 13.3-33.5 5.6s-13.3-22.7-5.6-33.5l11.1-15.6c23.7-33.2 72.3-35.6 99.2-4.9c21.3 24.4 20.8 60.9-1.1 84.7L86.8 432H120c13.3 0 24 10.7 24 24s-10.7 24-24 24H32c-9.5 0-18.2-5.6-22-14.4s-2.1-18.9 4.3-25.9l72-78c5.3-5.8 5.4-14.6 .3-20.5zM224 64H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H224c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 160H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H224c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 160H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H224c-17.7 0-32-14.3-32-32s14.3-32 32-32z"
                /></svg
              >
            </ToggleOrderedList>
            <div class="hidden sm:block w-px bg-gray-300 mx-3" />
            <InsertImage {currentUser} {editorState} {editorView}>
              <svg
                class="h-3 w-3 sm:h-4 sm:w-4"
                fill="currentColor"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                ><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
                  d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h96 32H424c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"
                /></svg
              >
            </InsertImage>
            <div class="hidden sm:block w-px bg-gray-300 mx-3" />
            <ToggleAICompletion {editorState} {editorView} bind:isPromptOpen>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-3 w-3 sm:h-4 sm:w-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                />
              </svg>
            </ToggleAICompletion>
          </div>
        {/if}

        <div class="flex-1 h-8" />
        <SecondaryButton type="button" on:click={handleCancel}>Cancel</SecondaryButton>
        <div class="shrink-0 w-2 sm:w-4" />
        <PrimaryButton type="button" on:click={handleSave}>Save</PrimaryButton>
      </div>
    </div>
  </div>
</div>

<svelte:window on:keydown={onKeyDown} />
