<script>
  import { extractTeaser, fetchJSON } from '$lib/util';
  import WebsiteNav from '$lib/components/WebsiteNav.svelte';
  import { goto } from '$app/navigation';
  import Footer from '$lib/components/Footer.svelte';
  import EditableWebsiteTeaser from '$lib/components/EditableWebsiteTeaser.svelte';
  import Article from '$lib/components/Article.svelte';
  import NotEditable from '$lib/components/NotEditable.svelte';
  import EditorToolbar from '$lib/components/EditorToolbar.svelte';

  export let data;

  let showUserMenu = false,
    editable = true,
    title = 'Untitled',
    content = 'Copy and paste your text here.';

  $: currentUser = data.currentUser;

  async function createArticle() {
    if (!currentUser) {
      return alert('Sorry, you are not authorized to create new articles.');
    }
    const teaser = extractTeaser(document.getElementById('article_content'));
    try {
      const { slug } = await fetchJSON('POST', '/api/create-article', {
        title,
        content,
        teaser
      });
      goto(`/blog/${slug}`);
    } catch (err) {
      console.error(err);
      alert('A document with that title has already been published. Choose a different title.');
    }
  }

  async function discardDraft() {
    goto('/blog');
  }
</script>

<svelte:head>
  <title>New blog post</title>
</svelte:head>

{#if editable}
  <EditorToolbar {currentUser} on:cancel={discardDraft} on:save={createArticle} />
{/if}

<WebsiteNav bind:editable bind:showUserMenu {currentUser} />
<Article bind:title bind:content {editable} />

<NotEditable {editable}>
  <EditableWebsiteTeaser />
</NotEditable>

<Footer {editable} />
