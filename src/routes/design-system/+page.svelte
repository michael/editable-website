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
					<!-- Main action. Mix the paired accent colors for hover and press; keep text opaque. -->
					<button
						type="button"
						class="inline-flex min-h-11 max-w-full min-w-11 items-center justify-center rounded-(--button-border-radius) border border-transparent bg-(--accent) px-5 py-2 text-center text-base leading-6 font-medium wrap-anywhere text-(--accent-foreground) focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--foreground) enabled:hover:bg-[color-mix(in_oklch,var(--accent),var(--accent-foreground)_10%)] enabled:active:bg-[color-mix(in_oklch,var(--accent),var(--accent-foreground)_20%)] disabled:opacity-40"
					>
						Continue
					</button>
				</div>

				<div id="button-secondary" class="min-w-0 space-y-4">
					<h3 class="text-sm text-(--muted-foreground)">Secondary</h3>
					<!-- Supporting action. A functional boundary and a surface-relative state fill. -->
					<button
						type="button"
						class="inline-flex min-h-11 max-w-full min-w-11 items-center justify-center rounded-(--button-border-radius) border border-(--foreground)/25 bg-transparent px-5 py-2 text-center text-base leading-6 font-medium wrap-anywhere text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--foreground) enabled:hover:bg-(--foreground)/5 enabled:active:bg-(--foreground)/10 disabled:opacity-40"
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
						class="inline-flex min-h-11 max-w-full min-w-6 items-center justify-start py-2.5 text-start text-base leading-6 font-medium wrap-anywhere text-(--foreground) underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--foreground) active:decoration-2"
					>
						Continue
					</a>
				</div>
			</div>
		</section>
	</div>
</main>
