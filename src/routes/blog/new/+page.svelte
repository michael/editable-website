<script>
  import { extractTeaser, fetchJSON } from '$lib/util';
  import { goto } from '$app/navigation';
  import Footer from '$lib/components/Footer.svelte';
  import EditableWebsiteTeaser from '$lib/components/EditableWebsiteTeaser.svelte';
  import Article from '$lib/components/Article.svelte';
  import NotEditable from '$lib/components/NotEditable.svelte';
  import { currentUser, isEditing } from '$lib/stores';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';

  export let data;

  let showUserMenu = false,
    title = 'Untitled',
    content = 'Copy and paste your text here.';

  $: {
    $currentUser = data.currentUser;
    $isEditing = true;
  }

  async function createArticle() {
    if (!$currentUser) {
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

<WebsiteHeader bind:showUserMenu on:cancel={discardDraft} on:save={createArticle} />

<Article bind:title bind:content />

<NotEditable>
  <EditableWebsiteTeaser />
</NotEditable>

<Footer counter="/blog/new" />
