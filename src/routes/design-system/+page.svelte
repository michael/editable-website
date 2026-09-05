<svelte:head>
	<title>Design system · Editable</title>
	<meta name="description" content="Editable's visual reference, in plain HTML and Tailwind." />
</svelte:head>

<!--
	Canonical visual recipes. Copy the classes into the element that fits the interaction.
	Keep examples explicit; adapt semantics and behavior in the consuming code.
	Colors, fonts, and corner radius come from app.css.
-->
<main class="min-h-screen bg-(--background) px-6 py-16 font-sans text-(--foreground) sm:px-10">
	<div class="mx-auto max-w-4xl space-y-16">
		<header class="space-y-3">
			<h1 class="text-3xl font-medium tracking-tight">Design system</h1>
			<p class="max-w-xl text-base leading-relaxed text-(--muted-foreground)">
				A shared starting point for Editable. Simple styles, ready to use and adapt.
			</p>
		</header>

		<section id="typography" aria-labelledby="typography-heading" class="space-y-10">
			<div class="space-y-2">
				<h2 id="typography-heading" class="text-xl font-medium">Typography</h2>
				<p class="text-sm leading-relaxed text-(--muted-foreground)">
					A shared scale for headings and body text.
				</p>
			</div>

			<!--
				Use the typography utilities directly; their Tailwind definitions live in app.css.
				Display sizes grow at lg. Weight, line height, and tracking belong to the utility.
				Choose the heading element for the document hierarchy, independently of its visual size.
				These specimens are all h3 because they sit within the Typography section.
			-->
			<div class="space-y-10">
				<div id="type-display-1" class="space-y-3">
					<p class="text-sm text-(--muted-foreground)">display-1</p>
					<h3 class="display-1">Make room for what matters.</h3>
				</div>
				<div id="type-display-2" class="space-y-3">
					<p class="text-sm text-(--muted-foreground)">display-2</p>
					<h3 class="display-2">Make room for what matters.</h3>
				</div>
				<div id="type-display-3" class="space-y-3">
					<p class="text-sm text-(--muted-foreground)">display-3</p>
					<h3 class="display-3">Make room for what matters.</h3>
				</div>
				<div id="type-display-4" class="space-y-3">
					<p class="text-sm text-(--muted-foreground)">display-4</p>
					<h3 class="display-4">Make room for what matters.</h3>
				</div>
				<div id="type-display-5" class="space-y-3">
					<p class="text-sm text-(--muted-foreground)">display-5</p>
					<h3 class="display-5">Make room for what matters.</h3>
				</div>
			</div>

			<!--
				Body sizes share regular weight and 1.5 line height. Body-xl also grows at lg.
				Reading width and spacing are layout choices, kept outside the typography utilities.
				Use the same copy at each size to compare rhythm and wrapping.
			-->
			<div class="space-y-10">
				<div id="type-body-xl" class="space-y-3">
					<p class="text-sm text-(--muted-foreground)">body-xl</p>
					<p class="max-w-prose body-xl">
						Good design makes everyday things easier to understand. Clear words, comfortable
						spacing, and a thoughtful hierarchy help people find what they need and decide what to
						do next.
					</p>
				</div>
				<div id="type-body-lg" class="space-y-3">
					<p class="text-sm text-(--muted-foreground)">body-lg</p>
					<p class="max-w-prose body-lg">
						Good design makes everyday things easier to understand. Clear words, comfortable
						spacing, and a thoughtful hierarchy help people find what they need and decide what to
						do next.
					</p>
				</div>
				<div id="type-body-base" class="space-y-3">
					<p class="text-sm text-(--muted-foreground)">body-base</p>
					<p class="max-w-prose body-base">
						Good design makes everyday things easier to understand. Clear words, comfortable
						spacing, and a thoughtful hierarchy help people find what they need and decide what to
						do next.
					</p>
				</div>
				<div id="type-body-sm" class="space-y-3">
					<p class="text-sm text-(--muted-foreground)">body-sm</p>
					<p class="max-w-prose body-sm">
						Good design makes everyday things easier to understand. Clear words, comfortable
						spacing, and a thoughtful hierarchy help people find what they need and decide what to
						do next.
					</p>
				</div>
			</div>
		</section>

		<section id="buttons" aria-labelledby="buttons-heading" class="space-y-8">
			<div class="space-y-2">
				<h2 id="buttons-heading" class="text-xl font-medium">Buttons</h2>
				<p class="text-sm leading-relaxed text-(--muted-foreground)">
					Standard size. Hover, press, or tab to explore the states.
				</p>
			</div>

			<!--
				Shared typography: 1rem text and 1.5 line height, with a 2.75rem minimum height.
				Primary and secondary share horizontal padding and a reserved 1px border.
				Standalone links align with surrounding text instead of inheriting button padding.
				Use an offset outline for keyboard focus, with no shadows or movement.
			-->
			<div class="grid gap-10 sm:grid-cols-3 sm:gap-8">
				<div id="button-primary" class="min-w-0 space-y-4">
					<h3 class="text-sm text-(--muted-foreground)">Primary</h3>
					<!-- Main action. Mix in sRGB for visible feedback even with black accents; keep text opaque. -->
					<button
						type="button"
						class="inline-flex min-h-11 max-w-full min-w-11 items-center justify-center rounded-(--button-border-radius) border border-transparent bg-(--accent) px-5 py-2 text-center text-base leading-6 font-medium wrap-anywhere text-(--accent-foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-[color-mix(in_srgb,var(--accent),var(--accent-foreground)_20%)] enabled:active:bg-[color-mix(in_srgb,var(--accent),var(--accent-foreground)_30%)] disabled:cursor-default disabled:opacity-40"
					>
						Continue
					</button>
				</div>

				<div id="button-secondary" class="min-w-0 space-y-4">
					<h3 class="text-sm text-(--muted-foreground)">Secondary</h3>
					<!-- Supporting action. Use the shared stroke token for the border and foreground tints for states. -->
					<button
						type="button"
						class="inline-flex min-h-11 max-w-full min-w-11 items-center justify-center rounded-(--button-border-radius) border border-(--stroke) bg-transparent px-5 py-2 text-center text-base leading-6 font-medium wrap-anywhere text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-(--foreground)/5 enabled:active:bg-(--foreground)/10 disabled:cursor-default disabled:opacity-40"
					>
						Continue
					</button>
				</div>

				<div id="button-link" class="min-w-0 space-y-4">
					<h3 class="text-sm text-(--muted-foreground)">Link</h3>
					<!--
						Standalone navigation: no horizontal padding or border, so text aligns with its surroundings.
						Keep the 44px minimum height and a 24px minimum width; short labels stay start-aligned.
						Inline links within prose need a separate recipe without this vertical sizing.
						Target guidance: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
					This local destination keeps the specimen usable without adding application behavior.
					For an action with this appearance, use a button and handle its disabled state explicitly.
					-->
					<a
						href="#buttons"
						class="inline-flex min-h-11 max-w-full min-w-6 items-center justify-start py-2.5 text-start text-base leading-6 font-medium wrap-anywhere text-(--foreground) underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) active:decoration-2"
					>
						Continue
					</a>
				</div>
			</div>
		</section>

		<section id="buttons-small" aria-labelledby="buttons-small-heading" class="space-y-8">
			<div class="space-y-2">
				<h2 id="buttons-small-heading" class="text-xl font-medium">Small buttons</h2>
				<p class="text-sm leading-relaxed text-(--muted-foreground)">
					For navigation and compact layouts.
				</p>
			</div>

			<!--
				Compact geometry: 0.875rem text, 1.25rem line height, and a 2.25rem minimum height.
				Keep medium weight at both sizes; emphasis comes from the variant, not heavier text.
				Touch inputs get a 2.75rem minimum target. Let content wrap and increase the height.
				These are explicit recipes, with the same colors and states as the standard size.
			-->
			<div class="grid gap-10 sm:grid-cols-3 sm:gap-8">
				<div id="button-primary-small" class="min-w-0 space-y-4">
					<h3 class="text-sm text-(--muted-foreground)">Primary</h3>
					<!-- Main action. Mix in sRGB for visible feedback even with black accents; keep text opaque. -->
					<button
						type="button"
						class="inline-flex min-h-9 max-w-full min-w-9 items-center justify-center rounded-(--button-border-radius) border border-transparent bg-(--accent) px-3 py-1.5 text-center text-sm leading-5 font-medium wrap-anywhere text-(--accent-foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-[color-mix(in_srgb,var(--accent),var(--accent-foreground)_20%)] enabled:active:bg-[color-mix(in_srgb,var(--accent),var(--accent-foreground)_30%)] disabled:cursor-default disabled:opacity-40 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
					>
						Continue
					</button>
				</div>

				<div id="button-secondary-small" class="min-w-0 space-y-4">
					<h3 class="text-sm text-(--muted-foreground)">Secondary</h3>
					<!-- Supporting action. Use the shared stroke token for the border and foreground tints for states. -->
					<button
						type="button"
						class="inline-flex min-h-9 max-w-full min-w-9 items-center justify-center rounded-(--button-border-radius) border border-(--stroke) bg-transparent px-3 py-1.5 text-center text-sm leading-5 font-medium wrap-anywhere text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-(--foreground)/5 enabled:active:bg-(--foreground)/10 disabled:cursor-default disabled:opacity-40 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
					>
						Continue
					</button>
				</div>

				<div id="button-link-small" class="min-w-0 space-y-4">
					<h3 class="text-sm text-(--muted-foreground)">Link</h3>
					<!-- Standalone link: preserve start alignment and omit horizontal padding at both sizes. -->
					<a
						href="#buttons"
						class="inline-flex min-h-9 max-w-full min-w-6 items-center justify-start py-2 text-start text-sm leading-5 font-medium wrap-anywhere text-(--foreground) underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) active:decoration-2 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
					>
						Continue
					</a>
				</div>
			</div>
		</section>
	</div>
</main>
