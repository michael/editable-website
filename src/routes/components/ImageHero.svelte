<script>
        import { getContext } from 'svelte';
        import { Node, CustomProperty, NodeArrayProperty, AnnotatedTextProperty } from 'svedit';
        import Image from './Image.svelte';

        const svedit = getContext('svedit');

        let { path } = $props();
        let node = $derived(svedit.session.get(path));
        let bg_node = $derived(svedit.session.get([...path, 'background']));
        let has_buttons = $derived(node.buttons?.length > 0);
        let layout = $derived(node.layout || 1);
        let colorset_class = $derived(node.colorset ? `ew-colorset-${node.colorset}` : '');

        // Determine if the background image CustomProperty is selected
        // This drives the checkerboard pattern when no image is loaded
        let is_bg_selected = $derived(is_background_selected());

        function is_background_selected() {
                const path_of_selection = svedit?.session?.selection?.path?.join('.');
                const bg_path = [...path, 'background'].join('.');
                return path_of_selection === bg_path;
        }
</script>

{#snippet background_image()}
        <!-- CustomProperty wrapping the image makes paste go through handle_media_paste's
             "property" branch, so pasting an image updates only the background src —
             it does not replace the whole hero block. -->
        <CustomProperty path={[...path, 'background']} class="image-hero-bg-property">
                <div
                        contenteditable="false"
                        class="inset-0 absolute overflow-hidden select-none"
                        class:ew-bg-checkerboard={is_bg_selected || !bg_node.src}
                >
                        <Image path={[...path, 'background']} />
                </div>
        </CustomProperty>
{/snippet}

{#snippet overlay()}
        <!-- Semi-transparent gradient overlay for text legibility -->
        <div class="inset-0 absolute image-hero-gradient pointer-events-none" aria-hidden="true"></div>
{/snippet}

<!-- Layout 1: centered text -->
{#snippet layout_1()}
        <div class="relative min-h-[90vh] flex items-center justify-center">
                {@render background_image()}
                {@render overlay()}
                <div class="relative z-10 text-center px-5 sm:px-7 md:px-10 lg:px-14 py-24 max-w-4xl mx-auto w-full">
                        <AnnotatedTextProperty
                                tag="h1"
                                class="ew-h1 font-serif text-4xl md:text-5xl lg:text-6xl text-balance text-white drop-shadow-lg"
                                path={[...path, 'title']}
                                placeholder="Your hero headline goes here"
                        />
                        <AnnotatedTextProperty
                                tag="p"
                                class="mt-6 text-lg md:text-xl text-white/90 text-balance drop-shadow"
                                path={[...path, 'description']}
                                placeholder="A compelling subtitle that draws visitors in."
                        />
                        <NodeArrayProperty
                                class="[--row:1] hero-buttons flex flex-wrap items-center justify-center gap-4 mt-10{!has_buttons ? ' empty' : ''}"
                                path={[...path, 'buttons']}
                        />
                </div>
        </div>
{/snippet}

<!-- Layout 2: left-aligned text -->
{#snippet layout_2()}
        <div class="relative min-h-[90vh] flex items-center">
                {@render background_image()}
                {@render overlay()}
                <div class="relative z-10 px-5 sm:px-7 md:px-10 lg:px-14 py-24 max-w-3xl w-full">
                        <AnnotatedTextProperty
                                tag="h1"
                                class="ew-h1 font-serif text-4xl md:text-5xl lg:text-6xl text-balance text-white drop-shadow-lg"
                                path={[...path, 'title']}
                                placeholder="Your hero headline goes here"
                        />
                        <AnnotatedTextProperty
                                tag="p"
                                class="mt-6 text-lg md:text-xl text-white/90 text-balance drop-shadow"
                                path={[...path, 'description']}
                                placeholder="A compelling subtitle that draws visitors in."
                        />
                        <NodeArrayProperty
                                class="[--row:1] hero-buttons flex flex-wrap items-center gap-4 mt-10{!has_buttons ? ' empty' : ''}"
                                path={[...path, 'buttons']}
                        />
                </div>
        </div>
{/snippet}

<Node class="ew-image-hero {colorset_class}" {path}>
        {@const layouts = [layout_1, layout_2]}
        {@render layouts[layout - 1]()}
</Node>

<style>
        :global(.ew-image-hero) {
                position: relative;
                overflow: hidden;
        }

        :global(.ew-image-hero .image-hero-bg-property) {
                position: absolute !important;
                inset: 0;
                z-index: 0;
        }

        .image-hero-gradient {
                background: linear-gradient(
                        to bottom,
                        rgba(0, 0, 0, 0.15) 0%,
                        rgba(0, 0, 0, 0.45) 60%,
                        rgba(0, 0, 0, 0.65) 100%
                );
                z-index: 1;
        }

        /* When buttons array is empty, prevent the empty node placeholder from taking up vertical space */
        :global(.ew-image-hero .hero-buttons.empty .node.empty-node-array) {
                position: absolute !important;
        }

        :global(.ew-image-hero h1) {
                --highlight-thickness: 6px;
        }
</style>
