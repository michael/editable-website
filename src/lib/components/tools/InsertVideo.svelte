<script>
  import { classNames, toBlob } from '$lib/util';
  import uuid from '$lib/uuid';
  import uploadAsset from '$lib/uploadAsset';
  import Modal from '$lib/components/Modal.svelte';
  import { insertImage } from '$lib/prosemirrorCommands';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import SecondaryButton from '$lib/components/SecondaryButton.svelte';

  export let editorView;
  export let editorState;
  export let currentUser;

  let fileInput; // for uploading an image
  let progress = undefined; // file upload progress
  let selectPoster = false;
  let videoEl;

  $: schema = editorState.schema;
  $: disabled = !insertImage(editorState, null, editorView);

  async function uploadVideo() {
    const file = fileInput.files[0];
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const posterFile = await toBlob(ctx.canvas);
    const videoId = uuid();
    const videoPath = [['videos', videoId].join('/'), 'mp4'].join('.');
    const posterPath = [['videos', videoId].join('/'), 'webp'].join('.');
    const { width, height } = { width: videoEl.videoWidth, height: videoEl.videoHeight };
    const src = currentUser ? `/assets/${videoPath}` : URL.createObjectURL(file);
    const poster = currentUser ? `/assets/${posterPath}` : URL.createObjectURL(file);

    progress = 0;
    try {
      if (currentUser) {
        // Upload video + poster
        await uploadAsset(file, videoPath, p => {
          progress = p;
        });
        await uploadAsset(posterFile, posterPath, p => {
          progress = p;
        });
      }

      editorView.dispatch(
        editorState.tr.replaceSelectionWith(
          schema.nodes.video.createAndFill({
            src,
            poster,
            width,
            height
          })
        )
      );
      editorView.focus();
      progress = undefined;
    } catch (err) {
      console.error(err);
      progress = undefined;
    }
    fileInput.value = null;
    selectPoster = false;
  }

  function getFileBlobUrl() {
    if (fileInput?.files) {
      return URL.createObjectURL(fileInput.files[0]);
    } else {
      return '';
    }
  }

  function cancel() {
    fileInput.value = null;
    selectPoster = false;
  }

  function onFileSelected() {
    selectPoster = true;
  }
</script>

<input
        class="w-px h-px opacity-0 fixed -top-40"
        type="file"
        accept="video/mp4"
        name="imagefile"
        multiple
        bind:this={fileInput}
        on:change={onFileSelected}
/>
<button
        on:click={() => fileInput.click()}
        {disabled}
        class={classNames('hover:bg-gray-100 sm:mx-1 rounded-full p-2 disabled:opacity-30')}
>
    <slot />
    {progress || ''}
</button>

{#if selectPoster}
    <Modal on:close={() => (selectPoster = false)}>
        <!-- svelte-ignore a11y-media-has-caption -->
        <div class="p-6">
            <div class="pb-4 text-xl font-medium">
                Select the frame, you'd like to use as a thumbnail:
            </div>
            <video bind:this={videoEl} controls>
                <source src={getFileBlobUrl()} type="video/mp4" />
            </video>
            <div class="flex pt-6 space-x-4">
                <div class="flex-1" />
                <SecondaryButton on:click={cancel} disabled={progress}>Cancel</SecondaryButton>
                <PrimaryButton on:click={uploadVideo} disabled={progress}>
                    {progress ? `Uploading... ${progress}%` : 'Upload Video'}
                </PrimaryButton>
            </div>
        </div>
    </Modal>
{/if}