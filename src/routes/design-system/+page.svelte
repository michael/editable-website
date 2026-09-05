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

		<section id="formatting" aria-labelledby="formatting-heading" class="space-y-8">
			<div class="space-y-2">
				<h2 id="formatting-heading" class="text-xl font-medium">Inline formatting</h2>
				<p class="text-sm leading-relaxed text-(--muted-foreground)">
					Emphasis and detail within the flow of a sentence.
				</p>
			</div>

			<!--
				Based on Emphasis, Strong, Link, Code, and Highlight in src/app/components.
				Formatting inherits the surrounding size and color unless its meaning calls for a change.
				Inline formatting styles are mutually exclusive: never nest or combine them on the same text.
				Use semantic HTML and keep marks inline so sentences can wrap naturally.
				Application components still own document references and editor behavior.
			-->
			<div class="space-y-8">
				<div id="format-emphasis" class="space-y-3">
					<h3 class="text-sm text-(--muted-foreground)">Emphasis · em</h3>
					<!-- Italic adds emphasis without introducing another weight or color. -->
					<p class="max-w-prose body-base">
						Start with what people <em class="italic">actually need</em>.
					</p>
				</div>

				<div id="format-strong" class="space-y-3">
					<h3 class="text-sm text-(--muted-foreground)">Bold · strong</h3>
					<!-- Semibold distinguishes important text within regular body copy. -->
					<p class="max-w-prose body-base">
						Keep the <strong class="font-semibold">most important information</strong> easy to find.
					</p>
				</div>

				<div id="format-link" class="space-y-3">
					<h3 class="text-sm text-(--muted-foreground)">Link · a</h3>
					<!--
						Prose links have no padding, minimum size, or flex display.
						Inherit the surrounding text color and retain a visible underline.
						Use underline thickness for hover feedback and the shared editing outline for focus.
					-->
					<p class="max-w-prose body-base">
						Explore the
						<a
							href="#typography"
							class="underline decoration-1 underline-offset-2 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) active:decoration-2"
							>typography styles</a
						>
						to see how the scale works.
					</p>
				</div>

				<div id="format-code" class="space-y-3">
					<h3 class="text-sm text-(--muted-foreground)">Code · code</h3>
					<!--
						Scale code relative to its surrounding text, with a foreground-derived surface.
						Clone the background and padding across wrapped lines. Long identifiers may break.
					-->
					<p class="max-w-prose body-base">
						Use <code
							class="rounded bg-(--foreground)/8 box-decoration-clone px-1 py-0.5 font-mono text-[0.9em] font-normal wrap-anywhere"
							>font-medium</code
						>
						for button labels.
					</p>
				</div>

				<div id="format-highlight" class="space-y-3">
					<h3 class="text-sm text-(--muted-foreground)">Highlight · mark</h3>
					<!--
						Use the existing accent pair rather than fixed yellow or the editor selection color.
						A small inline inset gives letters breathing room. Highlight is a standalone formatting style.
					-->
					<p class="max-w-prose body-base">
						Highlight <mark
							class="bg-(--accent) box-decoration-clone px-0.5 text-(--accent-foreground)"
							>the part worth remembering</mark
						>, not the whole paragraph.
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
		<section id="pills" aria-labelledby="pills-heading" class="space-y-10">
			<div class="space-y-2">
				<h2 id="pills-heading" class="text-xl font-medium">Editor pills</h2>
				<p class="text-sm leading-relaxed text-(--muted-foreground)">
					Compact surfaces for tools, actions, and previews.
				</p>
			</div>
			<!--
Shared pill shell: solid background, stroke border, token-based rounding, 4px padding and 4px gaps.
The registered --button-border-radius resolves to one inherited length, including em values.
Shell radius uses that length; inner radius subtracts padding plus border, clamped at zero.
No shadows, transparency, blur, or movement. The shell is a surface, not a clickable control.
Controls are 36px tall, or 44px for coarse pointers. Labels use 14px medium text.
Reuse the editor's existing SVG paths. Icons use currentColor and retain their native stroke weight.
Focus belongs to each control: 2px editing outline, 2px offset. Keep shell overflow visible.
These are visual specimens with native focus and pointer states; they do not execute editor commands.
Use a group here; production toolbar keyboard behavior belongs to the consuming component.
-->
			<div class="space-y-12">
				<div id="pill-toolbar" class="space-y-4">
					<h3 class="text-sm text-(--muted-foreground)">Toolbar</h3>
					<div
						role="group"
						aria-label="Page tools"
						class="inline-flex max-w-full items-center gap-1 rounded-(--button-border-radius) border border-(--stroke) bg-(--background) p-1 text-(--foreground)"
					>
						<button
							type="button"
							aria-label="New page"
							title="New page"
							class="inline-flex size-9 shrink-0 items-center justify-center rounded-[max(0px,calc(var(--button-border-radius)-0.25rem-1px))] border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-(--muted) enabled:active:bg-(--foreground)/10 disabled:cursor-default disabled:opacity-40 pointer-coarse:size-11"
							><svg class="size-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true"
								><path d="M12 5V19M5 12H19" stroke="currentColor" /></svg
							></button
						><button
							type="button"
							aria-label="Browse pages"
							title="Browse pages"
							class="inline-flex size-9 shrink-0 items-center justify-center rounded-[max(0px,calc(var(--button-border-radius)-0.25rem-1px))] border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-(--muted) enabled:active:bg-(--foreground)/10 disabled:cursor-default disabled:opacity-40 pointer-coarse:size-11"
							><svg class="size-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true"
								><rect x="4.5" y="4.5" width="6" height="6" rx="1" stroke="currentColor" /><rect
									x="13.5"
									y="4.5"
									width="6"
									height="6"
									rx="1"
									stroke="currentColor"
								/><rect x="4.5" y="13.5" width="6" height="6" rx="1" stroke="currentColor" /><rect
									x="13.5"
									y="13.5"
									width="6"
									height="6"
									rx="1"
									stroke="currentColor"
								/></svg
							></button
						><button
							type="button"
							aria-label="Edit page"
							title="Edit page"
							class="inline-flex size-9 shrink-0 items-center justify-center rounded-[max(0px,calc(var(--button-border-radius)-0.25rem-1px))] border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-(--muted) enabled:active:bg-(--foreground)/10 disabled:cursor-default disabled:opacity-40 pointer-coarse:size-11"
							><svg class="size-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true"
								><path
									d="M4.5 19.5L5.25 15.25L15.75 4.75C16.7165 3.7835 18.2835 3.7835 19.25 4.75C20.2165 5.7165 20.2165 7.2835 19.25 8.25L8.75 18.75L4.5 19.5ZM14 6.5L17.5 10"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
								/></svg
							></button
						><button
							type="button"
							aria-label="More page actions"
							title="More page actions"
							class="inline-flex size-9 shrink-0 items-center justify-center rounded-[max(0px,calc(var(--button-border-radius)-0.25rem-1px))] border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-(--muted) enabled:active:bg-(--foreground)/10 disabled:cursor-default disabled:opacity-40 pointer-coarse:size-11"
							><svg class="size-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true"
								><circle cx="6" cy="12" r="1" fill="currentColor" /><circle
									cx="12"
									cy="12"
									r="1"
									fill="currentColor"
								/><circle cx="18" cy="12" r="1" fill="currentColor" /></svg
							></button
						>
					</div>
				</div>
				<div id="pill-inline-action" class="space-y-4">
					<h3 class="text-sm text-(--muted-foreground)">Inline call to action</h3>
					<!-- A single editing action gets wider label padding, while retaining the shared shell and height. -->
					<div
						class="inline-flex max-w-full items-center gap-1 rounded-(--button-border-radius) border border-(--stroke) bg-(--background) p-1 text-(--foreground)"
					>
						<button
							type="button"
							class="inline-flex min-h-9 max-w-full min-w-0 items-center justify-center rounded-[max(0px,calc(var(--button-border-radius)-0.25rem-1px))] border-0 bg-transparent px-8 py-2 text-sm leading-5 font-medium wrap-anywhere text-(--editing) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-(--editing-muted) enabled:active:bg-(--editing)/15 disabled:cursor-default disabled:opacity-40 pointer-coarse:min-h-11"
							>Create link</button
						>
					</div>
				</div>
				<div id="pill-variant-selector" class="space-y-4">
					<h3 class="text-sm text-(--muted-foreground)">Variant selector and select parent</h3>
					<!-- The divider separates two actions. Only the selector shrinks; its status remains secondary text. -->
					<div
						role="group"
						aria-label="Selection tools"
						class="inline-flex max-w-full items-center gap-1 rounded-(--button-border-radius) border border-(--stroke) bg-(--background) p-1 text-(--foreground)"
					>
						<button
							type="button"
							aria-label="Select parent"
							title="Select parent"
							class="inline-flex size-9 shrink-0 items-center justify-center rounded-[max(0px,calc(var(--button-border-radius)-0.25rem-1px))] border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-(--muted) enabled:active:bg-(--foreground)/10 disabled:cursor-default disabled:opacity-40 pointer-coarse:size-11"
							><svg class="size-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true"
								><path
									d="M6.5 12.5C6.5 15.8137 9.18629 18.5 12.5 18.5C15.8137 18.5 18.5 15.8137 18.5 12.5C18.5 9.18629 15.8137 6.5 12.5 6.5M4.48278 4.48206L13 12.9993M9.44657 4.48173L4.48278 4.48206V9.44727"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
								/></svg
							></button
						><span aria-hidden="true" class="mx-1 h-5 w-px shrink-0 bg-(--stroke)"></span><button
							type="button"
							aria-label="Choose gallery variant, mixed selection"
							class="inline-flex min-h-9 min-w-0 items-center justify-center gap-2 rounded-[max(0px,calc(var(--button-border-radius)-0.25rem-1px))] border-0 bg-transparent px-3 py-2 text-sm leading-5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-(--muted) enabled:active:bg-(--foreground)/10 disabled:cursor-default disabled:opacity-40 pointer-coarse:min-h-11"
							><span class="min-w-0 truncate">Gallery</span><span
								class="shrink-0 font-mono text-xs font-normal text-(--muted-foreground)"
								>(mixed)</span
							><svg
								class="size-4 shrink-0 text-(--muted-foreground)"
								viewBox="0 0 24 24"
								fill="none"
								aria-hidden="true"
								><path
									d="M7 10L12 15L17 10"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/></svg
							></button
						>
					</div>
				</div>
				<div id="pill-link-preview" class="space-y-4">
					<h3 class="text-sm text-(--muted-foreground)">Link preview</h3>
					<!--
The preview link and its actions are siblings, never nested interactive elements.
The thumbnail slot shows an initials fallback; an actual thumbnail uses size-9 rounded-[max(0px,calc(var(--button-border-radius)-0.25rem-1px))] object-cover.
Only the preview title truncates. Keep edit and remove controls visible at narrow widths.
The local href is a specimen destination. Production links retain their own destination and target.
-->
					<div
						role="group"
						aria-label="Link preview"
						class="inline-flex max-w-full items-center gap-1 rounded-(--button-border-radius) border border-(--stroke) bg-(--background) p-1 text-(--foreground)"
					>
						<a
							href="#pills"
							class="inline-flex min-h-9 max-w-70 min-w-0 items-center gap-2 rounded-[max(0px,calc(var(--button-border-radius)-0.25rem-1px))] pr-3 text-sm leading-5 font-medium hover:bg-(--muted) hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) active:bg-(--foreground)/10 pointer-coarse:min-h-11"
							><span
								aria-hidden="true"
								class="inline-flex size-9 shrink-0 items-center justify-center rounded-[max(0px,calc(var(--button-border-radius)-0.25rem-1px))] bg-(--muted) text-xs font-medium text-(--muted-foreground)"
								>EW</span
							><span class="min-w-0 truncate">Why Editable?</span></a
						><button
							type="button"
							aria-label="Edit link"
							title="Edit link"
							class="inline-flex size-9 shrink-0 items-center justify-center rounded-[max(0px,calc(var(--button-border-radius)-0.25rem-1px))] border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-(--muted) enabled:active:bg-(--foreground)/10 disabled:cursor-default disabled:opacity-40 pointer-coarse:size-11"
							><svg class="size-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true"
								><path
									d="M4.5 19.5L5.25 15.25L15.75 4.75C16.7165 3.7835 18.2835 3.7835 19.25 4.75C20.2165 5.7165 20.2165 7.2835 19.25 8.25L8.75 18.75L4.5 19.5ZM14 6.5L17.5 10"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
								/></svg
							></button
						><button
							type="button"
							aria-label="Remove link"
							title="Remove link"
							class="inline-flex size-9 shrink-0 items-center justify-center rounded-[max(0px,calc(var(--button-border-radius)-0.25rem-1px))] border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-(--muted) enabled:active:bg-(--foreground)/10 disabled:cursor-default disabled:opacity-40 pointer-coarse:size-11"
							><svg class="size-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true"
								><path
									d="M5.5 7.5H18.5M9.5 4.5H14.5L15.5 7.5M7 7.5L7.75 19.5H16.25L17 7.5M10 10.5V16M14 10.5V16"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
								/></svg
							></button
						>
					</div>
				</div>
			</div>
		</section>
		<section id="popovers" aria-labelledby="popovers-heading" class="space-y-8">
			<div class="space-y-2">
				<h2 id="popovers-heading" class="text-xl font-medium">List popovers</h2>
				<p class="text-sm leading-relaxed text-(--muted-foreground)">
					Compact lists with a shared surface and aligned rows.
				</p>
			</div>
			<!--
List surfaces cap --button-border-radius at 1rem to leave room for the first and last rows.
Item radius = outer radius minus 4px padding and 1px border, clamped at zero.
Use the same shape for every row. A zero button radius makes the surface and all rows square.
Keep 4px padding around the list for the 2px focus outline plus 2px offset.
Use opaque background, stroke border, and no shadow. Rows use regular text and 40px minimum height.
These are permanently visible style references. Opening, dismissal, positioning, collision handling,
and menu keyboard behavior belong to the application; do not add menu roles without that behavior.
-->
			<div class="grid items-start gap-10 md:grid-cols-2">
				<div id="popover-context-menu" class="min-w-0 space-y-4">
					<h3 class="text-sm text-(--muted-foreground)">Context menu</h3>
					<!-- Disabled actions remain legible and suppress pointer, hover, and active treatments. -->
					<div
						role="group"
						aria-label="Page actions"
						class="w-56 max-w-full rounded-[min(1rem,var(--button-border-radius))] border border-(--stroke) bg-(--background) p-1"
					>
						<button
							type="button"
							class="flex min-h-10 w-full items-center rounded-[max(0px,calc(min(1rem,var(--button-border-radius))-0.25rem-1px))] border-0 bg-transparent px-3 py-2.5 text-start text-sm leading-5 font-normal wrap-anywhere text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-(--muted) enabled:active:bg-(--foreground)/10 disabled:cursor-default disabled:text-(--muted-foreground) pointer-coarse:min-h-11"
							>Duplicate page</button
						><button
							type="button"
							disabled
							class="flex min-h-10 w-full items-center rounded-[max(0px,calc(min(1rem,var(--button-border-radius))-0.25rem-1px))] border-0 bg-transparent px-3 py-2.5 text-start text-sm leading-5 font-normal wrap-anywhere text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-(--muted) enabled:active:bg-(--foreground)/10 disabled:cursor-default disabled:text-(--muted-foreground) pointer-coarse:min-h-11"
							>Edit URL</button
						><button
							type="button"
							disabled
							class="flex min-h-10 w-full items-center rounded-[max(0px,calc(min(1rem,var(--button-border-radius))-0.25rem-1px))] border-0 bg-transparent px-3 py-2.5 text-start text-sm leading-5 font-normal wrap-anywhere text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-(--muted) enabled:active:bg-(--foreground)/10 disabled:cursor-default disabled:text-(--muted-foreground) pointer-coarse:min-h-11"
							>Delete page</button
						>
						<hr class="my-1 border-0 border-t border-(--stroke)" />
						<button
							type="button"
							class="flex min-h-10 w-full items-center rounded-[max(0px,calc(min(1rem,var(--button-border-radius))-0.25rem-1px))] border-0 bg-transparent px-3 py-2.5 text-start text-sm leading-5 font-normal wrap-anywhere text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) enabled:cursor-pointer enabled:hover:bg-(--muted) enabled:active:bg-(--foreground)/10 disabled:cursor-default disabled:text-(--muted-foreground) pointer-coarse:min-h-11"
							>Logout</button
						>
					</div>
				</div>
				<div id="popover-table-of-contents" class="min-w-0 space-y-4">
					<h3 class="text-sm text-(--muted-foreground)">Table of contents</h3>
					<!--
Use navigation links rather than menu actions. Labels wrap instead of truncating.
The shell itself scrolls, with padding for focus clearance; do not add another rounded clipping layer.
These destinations are real sections on this reference page. Application contents use page headings.
-->
					<nav
						aria-label="Design system contents"
						class="max-h-80 w-96 max-w-full overflow-y-auto overscroll-contain rounded-[min(1rem,var(--button-border-radius))] border border-(--stroke) bg-(--background) p-1"
					>
						<ul class="list-none">
							<li>
								<a
									href="#typography"
									class="flex min-h-10 w-full items-center rounded-[max(0px,calc(min(1rem,var(--button-border-radius))-0.25rem-1px))] border-0 bg-transparent px-3 py-2.5 text-start text-sm leading-5 font-normal wrap-anywhere text-(--foreground) hover:bg-(--muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) active:bg-(--foreground)/10 pointer-coarse:min-h-11"
									>Typography</a
								>
							</li>
							<li>
								<a
									href="#formatting"
									class="flex min-h-10 w-full items-center rounded-[max(0px,calc(min(1rem,var(--button-border-radius))-0.25rem-1px))] border-0 bg-transparent px-3 py-2.5 text-start text-sm leading-5 font-normal wrap-anywhere text-(--foreground) hover:bg-(--muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) active:bg-(--foreground)/10 pointer-coarse:min-h-11"
									>Inline formatting</a
								>
							</li>
							<li>
								<a
									href="#buttons"
									class="flex min-h-10 w-full items-center rounded-[max(0px,calc(min(1rem,var(--button-border-radius))-0.25rem-1px))] border-0 bg-transparent px-3 py-2.5 text-start text-sm leading-5 font-normal wrap-anywhere text-(--foreground) hover:bg-(--muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) active:bg-(--foreground)/10 pointer-coarse:min-h-11"
									>Standard buttons</a
								>
							</li>
							<li>
								<a
									href="#buttons-small"
									class="flex min-h-10 w-full items-center rounded-[max(0px,calc(min(1rem,var(--button-border-radius))-0.25rem-1px))] border-0 bg-transparent px-3 py-2.5 text-start text-sm leading-5 font-normal wrap-anywhere text-(--foreground) hover:bg-(--muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) active:bg-(--foreground)/10 pointer-coarse:min-h-11"
									>Small buttons</a
								>
							</li>
							<li>
								<a
									href="#pills"
									class="flex min-h-10 w-full items-center rounded-[max(0px,calc(min(1rem,var(--button-border-radius))-0.25rem-1px))] border-0 bg-transparent px-3 py-2.5 text-start text-sm leading-5 font-normal wrap-anywhere text-(--foreground) hover:bg-(--muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) active:bg-(--foreground)/10 pointer-coarse:min-h-11"
									>Editor pills</a
								>
							</li>
							<li>
								<a
									href="#popovers"
									class="flex min-h-10 w-full items-center rounded-[max(0px,calc(min(1rem,var(--button-border-radius))-0.25rem-1px))] border-0 bg-transparent px-3 py-2.5 text-start text-sm leading-5 font-normal wrap-anywhere text-(--foreground) hover:bg-(--muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--editing) active:bg-(--foreground)/10 pointer-coarse:min-h-11"
									>List popovers</a
								>
							</li>
						</ul>
					</nav>
				</div>
			</div>
		</section>
	</div>
</main>
