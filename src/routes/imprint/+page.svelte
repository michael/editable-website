<script>
  import WebsiteNav from '$lib/components/WebsiteNav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import PlainText from '$lib/components/PlainText.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import LoginMenu from '$lib/components/LoginMenu.svelte';
  import PrimaryButton from '$lib/components/PrimaryButton.svelte';
  import { fetchJSON } from '$lib/util';
  import EditorToolbar from '$lib/components/EditorToolbar.svelte';

  export let data;
  $: currentUser = data.currentUser;

  let editable = false,
    showUserMenu = false,
    title,
    imprint;

  // --------------------------------------------------------------------------
  // DEFAULT PAGE CONTENT - AJDUST TO YOUR NEEDS
  // --------------------------------------------------------------------------

  function initOrReset() {
    title = data.page?.title || 'Imprint';
    imprint =
      data.page?.imprint ||
      [
        ['Ken Experiences GmbH', 'Mozartstraße 56', '4020 Linz, Austria'].join('<br/>'),
        [
          'Managing Director: DI Michael Aufreiter',
          'Register No: FN 408728x',
          'Court: Linz',
          'VAT ID: ATU68395257'
        ].join('<br/>')
      ]
        .map(text => `<p>${text}</p>`)
        .join('\n');
    editable = false;
  }

  initOrReset();

  function toggleEdit() {
    editable = true;
    showUserMenu = false;
  }

  async function savePage() {
    if (!currentUser) return alert('Sorry, you are not authorized.');
    try {
      fetchJSON('POST', '/api/save-page', {
        pageId: 'imprint',
        page: {
          title,
          imprint
        }
      });
      editable = false;
    } catch (err) {
      console.error(err);
      alert('There was an error. Please try again.');
    }
  }
</script>

<svelte:head>
  <title>Imprint</title>
</svelte:head>

{#if showUserMenu}
  <Modal on:close={() => (showUserMenu = false)}>
    <div class="w-full flex flex-col space-y-4 p-4 sm:p-6">
      <PrimaryButton on:click={toggleEdit}>Edit page</PrimaryButton>
      <LoginMenu {currentUser} />
    </div>
  </Modal>
{/if}

{#if editable}
  <EditorToolbar on:cancel={initOrReset} on:save={savePage} />
{/if}

<WebsiteNav bind:showUserMenu {currentUser} bind:editable />

<div class="py-12 sm:py-24">
  <div class="max-w-screen-md mx-auto px-6 md:text-xl">
    <h1 class="text-4xl md:text-7xl font-bold pb-8">
      <PlainText {editable} bind:content={title} />
    </h1>
    <div class="prose md:prose-xl pb-12 sm:pb-24">
      <RichText multiLine {editable} bind:content={imprint} />
    </div>
  </div>
</div>

<Footer counter="/imprint" />
