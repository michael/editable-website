<script>
  import PlainText from '$lib/components/PlainText.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import { formatDate } from '$lib/util';
  export let title;
  export let content;
  export let publishedAt = undefined;
  export let editable;
</script>

<div>
  <div class="max-w-screen-md mx-auto px-6">
    <div class="pt-12 sm:pt-24">
      {#if !publishedAt}
        <div class="font-bold text-sm">DRAFT</div>
      {:else}
        <div class="font-bold text-sm">{formatDate(publishedAt)}</div>
      {/if}
    </div>
    <h1 class="text-3xl md:text-5xl font-bold pt-1">
      <PlainText {editable} bind:content={title} />
    </h1>
  </div>
</div>

<div class="max-w-screen-md mx-auto px-6 pb-12 sm:pb-24">
  <div id="article_content" class="prose sm:prose-xl">
    <RichText multiLine {editable} bind:content />
  </div>
</div>
