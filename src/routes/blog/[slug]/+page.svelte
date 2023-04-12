<script>
  import { extractTeaser, fetchJSON } from '$lib/util';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import WebsiteNav from '$lib/components/WebsiteNav.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import { goto } from '$app/navigation';
  import Footer from '$lib/components/Footer.svelte';
  import ArticleTeaser from '$lib/components/ArticleTeaser.svelte';
  import EditableWebsiteTeaser from '$lib/components/EditableWebsiteTeaser.svelte';
  import Article from '$lib/components/Article.svelte';
  import NotEditable from '$lib/components/NotEditable.svelte';
  import EditorToolbar from '$lib/components/EditorToolbar.svelte';

  export let data;

  let showUserMenu = false;
  let editable, title, teaser, content, publishedAt, updatedAt;

  $: currentUser = data.currentUser;

  $: {
    // HACK: To make sure this is only run when the parent passes in new data
    data = data;
    initOrReset();
  }

  function initOrReset() {
    title = data.title;
    teaser = data.teaser;
    content = data.content;
    publishedAt = data.publishedAt;
    updatedAt = data.updatedAt;
    editable = false;
  }

  function toggleEdit() {
    editable = true;
    showUserMenu = false;
  }

  async function deleteArticle() {
    if (!currentUser) return alert('Sorry, you are not authorized.');
    try {
      fetchJSON('POST', '/api/delete-article', {
        slug: data.slug
      });
      goto('/blog');
    } catch (err) {
      console.error(err);
      alert('Error deleting the article. Try again.');
      window.location.reload();
    }
  }

  async function saveArticle() {
    if (!currentUser) return alert('Sorry, you are not authorized.');
    const teaser = extractTeaser(document.getElementById('article_content'));
    try {
      const result = await fetchJSON('POST', '/api/update-article', {
        slug: data.slug,
        title,
        content,
        teaser
      });
      updatedAt = result.updatedAt;
      editable = false;
    } catch (err) {
      console.error(err);
      alert(
        'There was an error. You can try again, but before that, please just copy and paste your article into a safe place.'
      );
    }
  }
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={teaser} />
</svelte:head>

{#if editable}
  <EditorToolbar {currentUser} on:cancel={initOrReset} on:save={saveArticle} />
{/if}

<WebsiteNav bind:editable bind:showUserMenu {currentUser} />

{#if showUserMenu}
  <Modal on:close={() => (showUserMenu = false)}>
    <form class="w-full block" method="POST">
      <div class="w-full flex flex-col space-y-4 p-4 sm:p-6">
        <PrimaryButton on:click={toggleEdit}>Edit post</PrimaryButton>
        <PrimaryButton type="button" on:click={deleteArticle}>Delete post</PrimaryButton>
        <LoginMenu {currentUser} />
      </div>
    </form>
  </Modal>
{/if}

<Article bind:title bind:content bind:publishedAt {editable} />

{#if data.articles.length > 0}
  <NotEditable {editable}>
    <div class="border-t-2 border-gray-100">
      <div class="max-w-screen-md mx-auto px-6 pt-8 sm:pt-12">
        <div class="font-bold text-sm">READ NEXT</div>
      </div>
      {#each data.articles as article, i}
        <ArticleTeaser {article} firstEntry={i === 0} />
      {/each}
    </div>
  </NotEditable>
{/if}

<NotEditable {editable}>
  <EditableWebsiteTeaser />
</NotEditable>

<Footer counter={`/blog/${data.slug}`} />
