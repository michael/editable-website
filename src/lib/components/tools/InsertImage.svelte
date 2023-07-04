<script>
  import { classNames, resizeImage, getDimensions, nanoid, is_safari } from '$lib/util';
  import uploadAsset from '$lib/uploadAsset';
  import { insertImage } from '$lib/editor/prosemirrorCommands';
  import { currentUser } from '$lib/stores';

  export let editorView;
  export let editorState;

  let fileInput; // for uploading an image
  let progress = undefined; // file upload progress

  $: schema = editorState.schema;
  $: disabled = !insertImage(editorState, null, editorView);

  async function uploadImage() {
    const file = fileInput.files[0];

    // We convert all uploads to the WEBP image format
    const content_type = is_safari() ? 'image/jpeg' : 'image/webp';

    // We convert all uploads to the WEBP image format if possible
    const extension = is_safari() ? 'jpg' : 'webp';

    const path = [['images', nanoid()].join('/'), extension].join('.');
    const maxWidth = 1440;
    const maxHeight = 1440;
    const quality = 0.8;

    const resizedBlob = await resizeImage(file, maxWidth, maxHeight, quality, content_type);
    const resizedFile = new File([resizedBlob], `${file.name.split('.')[0]}.${extension}`, {
      type: content_type
    });

    const { width, height } = await getDimensions(resizedFile);
    const src = $currentUser ? `/assets/${path}` : URL.createObjectURL(resizedFile);

    progress = 0;
    try {
      if ($currentUser) {
        await uploadAsset(resizedFile, path, p => {
          progress = p;
        });
      }

      editorView.dispatch(
        editorState.tr.replaceSelectionWith(
          schema.nodes.image.createAndFill({
            src,
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
  }
</script>

<input
  class="w-px h-px opacity-0 fixed -top-40"
  type="file"
  accept="image/*"
  name="imagefile"
  multiple
  bind:this={fileInput}
  on:change={uploadImage}
/>
<button
  on:click={() => fileInput.click()}
  {disabled}
  class={classNames('hover:bg-gray-100 sm:mx-1 rounded-full p-2 disabled:opacity-30')}
>
  <slot />
  {progress || ''}
</button>