<script>
  import { uuid } from '$lib/utils';
  import { resizeImage } from '$lib/util';
  import uploadAsset from '$lib/uploadAsset';
  import { currentUser } from '$lib/stores';

  export let src;
  export let alt;
  export let uploadPrompt = undefined;
  export let maxWidth;
  export let maxHeight;
  export let quality;
  let className = '';
  export { className as class };

  let fileInput; // for uploading an image
  let progress = undefined; // file upload progress

  async function uploadImage() {
    const file = fileInput.files[0];

    // We convert all uploads to the WEBP image format
    const extension = 'webp';
    const path = [['images', uuid()].join('/'), extension].join('.');

    const resizedBlob = await resizeImage(file, maxWidth, maxHeight, quality);
    const resizedFile = new File([resizedBlob], `${file.name.split('.')[0]}.webp`, {
      type: 'image/webp'
    });

    progress = 0;
    try {
      if ($currentUser) {
        await uploadAsset(resizedFile, path, p => {
          progress = p;
        });
        src = `/assets/${path}`;
      } else {
        src = URL.createObjectURL(file);
      }
      progress = undefined;
    } catch (err) {
      console.error(err);
      alert('An error occured. Please try again');
      progress = undefined;
    }
    fileInput.value = null;
  }
</script>

<img
        on:mousedown={() => fileInput.click()}
        class={className + ' cursor-pointer hover:outline-dashed outline-[#EF174C]'}
        {src}
        {alt}
        title={uploadPrompt}
/>

<input
        class="w-px h-px opacity-0 fixed -top-40"
        type="file"
        accept="image/*"
        name="imagefile"
        bind:this={fileInput}
        on:change={uploadImage}
/>