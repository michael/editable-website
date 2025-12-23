<script>
	import { getContext } from 'svelte';
	import { Node, CustomProperty, AnnotatedTextProperty } from 'svedit';
	import Image from './Image.svelte';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let image_node = $derived(svedit.session.get([...path, 'image']));
	let is_selected = $derived(is_image_selected());

	const TITLE_PLACEHOLDER = 'MODULUS MATRIX - 85 Social housing in Cornellà Cornellà 2021';
	const DESCRIPTION_PLACEHOLDER = 'Para los 10.000 m2 de superficie edificada del nuevo edificio ubicado en Cornellà de Llobregat (Barcelona), que consta de 85 viviendas sociales distribuidas en 5 alturas, se han utilizado un total de 8.300 m2 de madera KM0 procedente del País Vasco. El diseño de una matriz de habitaciones comunicantes, que elimina pasillos para garantizar el máximo aprovechamiento en planta, y el uso de la madera en favor de las posibilidades de industrialización del edificio, la mejora de la calidad de la construcción y la notable reducción de los plazos de ejecución y las emisiones de C02, son los ejes de este nuevo edificio de viviendas.';

	function is_image_selected() {
		const path_of_selection = svedit?.session?.selection?.path?.join('.');
		const _image_path = [...path, 'image'].join('.');
		return path_of_selection == _image_path;
	}
</script>

<!-- Primitives -->
{#snippet image(aspect_ratio)}
  <CustomProperty class="ew-image-property" path={[...path, 'image']}>
    <div
      contenteditable="false"
      style:aspect-ratio={aspect_ratio}
      class="ew-image-wrapper h-full w-full overflow-hidden select-none"
      class:ew-bg-checkerboard={is_selected || !image_node.src}
    >
      <Image path={[...path, 'image']} />
    </div>
  </CustomProperty>
{/snippet}

{#snippet big_title()}
  <AnnotatedTextProperty tag="h1" class="text-4xl text-balance" path={[...path, 'title']} placeholder={TITLE_PLACEHOLDER} />
{/snippet}

{#snippet small_title()}
  <AnnotatedTextProperty tag="h1" class="text-xl uppercase text-balance" path={[...path, 'title']} placeholder={TITLE_PLACEHOLDER} />
{/snippet}

{#snippet description()}
  <AnnotatedTextProperty tag="p" class="text-gray-600" path={[...path, 'description']} placeholder={DESCRIPTION_PLACEHOLDER} />
{/snippet}

<!-- Layouts -->
{#snippet layout_1()}
  <div class="mx-auto max-w-7xl grid grid-cols-2">
    <div class="flex flex-col p-15">
      {@render big_title()}
      <div class="flex-1"></div>
      {@render description()}
    </div>
    <div class="p-15">
      {@render image(3/4)}
    </div>
  </div>
{/snippet}

<!-- Like layout 1 but flipped horizontally -->
{#snippet layout_2()}
  <div class="mx-auto max-w-7xl grid grid-cols-2">
    <div class="p-15">
      {@render image(3/4)}
    </div>
    <div class="flex flex-col p-15">
      {@render big_title()}
      <div class="flex-1"></div>
      {@render description()}
    </div>
  </div>
{/snippet}

<!-- Like layout 1 but image stretches to edges -->
{#snippet layout_3()}
  <div class="mx-auto max-w-7xl grid grid-cols-2">
    <div>
      {@render image(3/4)}
    </div>
    <div class="flex flex-col p-15">
      {@render big_title()}
      <div class="flex-1"></div>
      {@render description()}
    </div>
  </div>
{/snippet}

<!-- Like layout 2 but, but image stretches to edges -->
{#snippet layout_4()}
  <div class="mx-auto max-w-7xl grid grid-cols-2">
    <div class="flex flex-col p-15">
      {@render big_title()}
      <div class="flex-1"></div>
      {@render description()}
    </div>
    <div>
      {@render image(3/4)}
    </div>
  </div>
{/snippet}

<!-- Like layout 1 but title (small) + description aligned at top -->
{#snippet layout_5()}
  <div class="mx-auto max-w-7xl grid grid-cols-2">
    <div class="flex flex-col p-15">
      <div class="flex-1"></div>
      {@render small_title()}
      <div class="pt-4">{@render description()}</div>
    </div>
    <div class="p-15">
      {@render image(3/4)}
    </div>
  </div>
{/snippet}

<!-- Like layout 2 but title (small) + description aligned at bottom -->
{#snippet layout_6()}
  <div class="mx-auto max-w-7xl grid grid-cols-2">
    <div class="p-15">
      {@render image(3/4)}
    </div>
    <div class="flex flex-col p-15">
      {@render small_title()}
      <div class="pt-4">{@render description()}</div>
      <div class="flex-1"></div>
    </div>
  </div>
{/snippet}

<Node class="ew-feature" {path}>
  {@const layouts = [
    layout_1,
    layout_2,
    layout_3,
    layout_4,
    layout_5,
    layout_6]}
  {@render layouts[node.layout - 1]()}
</Node>
