# Editable design system

Status: proposal for review. The first implementation milestone is text-only buttons. This document plans the work; it does not establish approved visual recipes yet.

## Intent

Editable should provide a beautiful generic foundation for many different websites. A user should be able to change only the colors and fonts in `src/app.css` and still get a coherent design. Its identity should come from typography, proportion, spacing, and clarity.

- Use plain Tailwind utilities for visual recipes.
- Keep the visual language simple: flat fills, restrained shapes, clear hierarchy, and generous but purposeful spacing.
- Avoid decorative strokes, gradients, drop shadows, ornamental elements, and effects that depend on a particular background color. Functional boundaries, link underlines, and focus outlines are appropriate when they communicate something.
- Make colors and fonts interchangeable without requiring layout changes or font-specific pixel offsets.
- Prefer a small, deliberate set of variants over a large collection of barely different choices.
- Treat “perfect generic” as a quality goal to validate across themes, fonts, content, and input methods.

## Where decisions live

| Location                                                                 | Responsibility                                                                                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app.css`                                                            | Shared color and font tokens, and any approved global design primitives.                                                                    |
| `/design-system`, implemented in `src/routes/design-system/+page.svelte` | Canonical rendered examples and their exact Tailwind markup. The source of truth for visual variants.                                       |
| `DESIGN_SYSTEM.md`                                                       | Principles, rationale, implementation plan, and outstanding decisions. Link to approved recipes rather than maintaining a second copy here. |
| Application components                                                   | Semantics, behavior, editor integration, and composition, using the canonical visual recipes.                                               |
| `AGENTS.md`                                                              | A short instruction directing agents to consult the design system before implementing or changing UI.                                       |

The reference page should contain ordinary HTML elements with literal Tailwind classes. Do not render application components, import button components, hide recipes behind class builders, or add a component API. Native hover, focus, active, and disabled styling belongs in the examples; application behavior does not.

Each recipe needs a stable section anchor, a name, its intended use, a rendered example, and inspectable markup. If the page also displays code, keep it synchronized with the rendered example rather than maintaining two independent recipes. Supporting page organization must not obscure the actual HTML and classes.

The page should work without a backend or editor session, including static deployments. Check routing, prerendering, and the root layout when adding it. Reserve `/design-system` explicitly because content currently uses a dynamic `[page_id]` route.

## Current starting point

- `src/app.css` already defines `--background`, `--foreground`, `--muted`, `--stroke`, `--muted-foreground`, `--accent`, and `--accent-foreground`, plus font families and `--button-border-radius`.
- Editing controls have their own `--editing` token family. Website buttons should use website tokens; decide the editor treatment separately.
- `Button.svelte` currently has primary, secondary, and link layouts. `NavButton.svelte` has primary and secondary layouts with different sizing. Other controls also define their own button styles.
- There is no dedicated `/design-system` route in the repository yet.
- Existing typography utilities and shadow tokens are historical starting points, not automatic approval for new recipes. Review them incrementally when their category is addressed.

## Proportion and spacing

Use the supplied LiftKit screenshots as references for two ideas: spacing should express relationships, and internal spacing should relate to typography. Closely related content gets smaller gaps; distinct groups get larger gaps.

The screenshots show a scale of approximately `0.236`, `0.382`, `0.618`, `1`, `1.618`, `2.618`, and `4.236`, based on the golden ratio. They also show a button construction relating padding to text size. These are candidate design heuristics, not evidence that one ratio produces universally optimal interfaces. The cropped button diagram is insufficient to specify a complete CSS recipe, especially across different font metrics.

For the first comparison:

- Start with Tailwind's existing spacing steps; avoid introducing a second global spacing system before we have compared results.
- Compare one text-relative button candidate inspired by LiftKit against the simpler Tailwind baseline below. Keep font, color, and label identical so we can judge proportion.
- Use `rem` for page rhythm and minimum control dimensions; consider `em` for internal padding that should track label size. State the unit explicitly rather than treating them as interchangeable.
- Judge the space around visible letterforms, as well as the CSS line box. Allow enough line height for accents and different scripts; avoid per-font transforms or negative margins.
- Document the chosen values and their intended relationships after visual review. Consistency and usability take priority over mathematical purity.

## First milestone: text-only buttons

### Visual family

Start with two core variants and review a third, quiet treatment alongside them:

| Variant   | Purpose                          | Proposed treatment                                                                                        |
| --------- | -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Primary   | The main action in a local group | Solid `--accent` fill with `--accent-foreground` text.                                                    |
| Secondary | A supporting action              | Transparent fill, `--foreground` text, and a functional thin boundary derived from the theme.             |
| Quiet     | A low-emphasis action            | Transparent fill and `--foreground` text; use spacing and state treatment to make it usable as a control. |

Primary and secondary should share typography, geometry, and padding. Hierarchy comes from treatment rather than making secondary buttons smaller. A quiet control should retain the same target geometry when placed beside them.

The existing `link` layout needs an explicit decision: retain it as a separate underlined navigation treatment, or migrate it later. Do not silently reinterpret stored `link` layouts as quiet buttons. HTML semantics remain independent of appearance: actions use buttons; navigation uses anchors.

Icons, icon-only buttons, loading indicators, split buttons, toggles, and destructive variants are outside this first milestone.

### Initial geometry to compare

These are proposed starting values, not approved recipes or research-derived constants. Pixel equivalents assume a 16px root font size.

| Property           | Starting proposal                                                 | Reason                                                             |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| Label              | `font-sans`, `text-base`, `font-medium`, `leading-normal`         | Readable text with room for varied font metrics.                   |
| Minimum dimensions | `min-h-11 min-w-11` (44px)                                        | A generous baseline target that can grow with content.             |
| Padding            | `px-5 py-2.5` (20px / 10px)                                       | A simple 2:1 horizontal-to-vertical starting proportion.           |
| Shape              | `rounded-(--button-border-radius)`                                | Reuse the existing token; review its current pill-like result.     |
| Alignment          | Inline flex, centered label, centered text                        | Natural content width and stable alignment.                        |
| Boundary           | Reserve the same border width across filled and outlined variants | Avoid geometry changes between variants or states.                 |
| Group gap          | `gap-3` (12px), wrapping when necessary                           | Separate targets without making related actions feel disconnected. |

Minimum height is a floor, not an exact height. The proposed line height, padding, and border will normally produce a taller button. Compare that rendered result before choosing final values.

Start with one default size. Add a compact navigation size or a larger call-to-action size only after demonstrating a real need. Size variants should form one family, rather than independent designs.

Labels should use sentence case, preserve their full meaning, and size the button naturally. Test short and long labels. Permit wrapping when space is constrained, with height growing naturally; do not clip or ellipsize action text. Button groups can wrap or stack. Full-width layout is a composition choice, not a separate visual variant.

### Theme and state rules

- Resolve all colors through `app.css` tokens. No hardcoded white text, black overlays, or assumptions that the page is light.
- Treat theme colors as semantic pairs. Arbitrary color choices cannot guarantee readable contrast; validate the actual pairs and correct the theme when needed.
- Use an explicit focus outline with sufficient offset and contrast against the surrounding surface. Do not rely on a drop shadow for focus. Propose a website focus token only if the existing website tokens cannot express the requirement cleanly.
- Show default, hover, active, keyboard focus, and disabled states for each approved variant. Include focused-and-hovered examples so one state cannot hide another.
- Prefer flat color changes for hover and active. Avoid moving or scaling the button, changing border width, or reducing the opacity of the entire enabled control. Validate any token-derived color mixes before adopting them.
- Disabled controls must look distinct, retain legible labels as a design goal, and suppress enabled hover/active styling. Use native `disabled` for button specimens; disabled link behavior belongs to a later component decision.
- Start without animation. If transitions improve the result, keep them brief and limited to colors, with reduced-motion preferences respected.

### Accessibility constraints

Use accessibility standards as concrete constraints alongside visual judgment:

- Normal-size labels need at least 4.5:1 text contrast in enabled states. See [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- Visual information needed to identify a control or state needs 3:1 contrast against adjacent colors. Not every decorative boundary is subject to this requirement; evaluate the information the button depends on. See [WCAG non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
- WCAG 2.2 AA uses a 24 by 24 CSS pixel target minimum with exceptions. We propose a more generous 44 by 44 baseline, consistent with the enhanced AAA target criterion. Check the actual clickable shape, especially for short labels and rounded corners. See [minimum target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) and [enhanced target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).
- Verify keyboard focus visibility, text enlargement, narrow-screen reflow, and forced-colors mode in the browser. Avoid fixed heights and outline removal that prevent these from working.

These requirements constrain the design; they do not determine the aesthetically best padding, radius, or font weight.

### Review specimens

The button section should show the actual recipes across:

- Primary, secondary, and the proposed quiet treatment, with all listed states.
- Light, dark, and chromatic themes using scoped overrides of the same tokens; examples on both background and muted surfaces.
- The default font plus a serif and a monospace substitution in the button font role, including fallback-font rendering. Theme and font comparisons must use identical recipe classes.
- Labels such as “OK”, “Save changes”, “Continue to checkout”, and accented or non-Latin text.
- Single buttons, paired actions, and wrapping groups at narrow widths, with enlarged text.

Use static labeled specimens for inspecting states and real native elements for keyboard and pointer checks. Keep theme previews local to the reference page rather than introducing production theme-switching behavior.

## Implementation sequence

### Editor pill references

The `/design-system#pills` section now contains four concrete, static references:

| Reference anchor        | Example                                             | Intended use                                    |
| ----------------------- | --------------------------------------------------- | ----------------------------------------------- |
| `pill-toolbar`          | New page, browse, edit, and more actions            | Grouped page tools.                             |
| `pill-inline-action`    | Create link                                         | A single contextual editing action.             |
| `pill-variant-selector` | Select parent, divider, Gallery, and mixed status   | Two related selection controls in one surface.  |
| `pill-link-preview`     | Thumbnail fallback, Why Editable?, edit, and remove | A navigable preview with separate link actions. |

The exact markup and classes live in `src/routes/design-system/+page.svelte`. These references use flat, opaque surfaces and functional borders instead of shadows. Individual controls receive focus; the surrounding pill does not. The preview includes an initials fallback for its thumbnail slot. Positioning, menus, editor commands, and keyboard behavior remain responsibilities of consuming components.

The reference examples establish the proposed pill styling; the existing application pills have not yet been migrated. The user performs visual verification, including checking the shadow-free surfaces over images. Agents use code checks unless browser verification is explicitly requested.

### Original rollout plan

1. Review this proposal, particularly the variant set, baseline proportions, and corner shape.
2. Build `/design-system` with the button comparison specimens in plain Tailwind. Keep candidate recipes clearly marked until selected.
3. Review in-browser across the theme, font, content, and accessibility cases above. Choose one baseline and remove rejected candidates from the canonical recipe section.
4. Record the selected rationale here and add a concise lookup instruction to `AGENTS.md`: consult the page and its source before styling UI; add missing variants there first; update the recipe and affected consumers together.
5. Apply approved recipes to `Button.svelte` and `NavButton.svelte`, preserving document layouts, navigation semantics, and editor behavior. Update relevant README guidance when the customization workflow changes.
6. Expand category by category: typography and spacing, links, form controls, then recurring layout patterns. Address editor controls explicitly when their turn comes.

## Keeping the source of truth useful

Every new visual variant should have a concrete use case and a canonical example before application code adopts it. Components may differ in structure and behavior, but should not invent new padding, colors, radii, or state treatments for an existing variant.

Literal Tailwind markup in the reference page means consumers will repeat classes. Accept that tradeoff for direct inspectability; prevent drift through review and by updating affected consumers with each recipe change. Do not introduce a shared button component merely to render the reference page.

For each milestone, verify only what changed: visually inspect the relevant specimens, check native interactions and responsive behavior, and run the repository checks appropriate to implementation. A documentation-only proposal does not need application tests.

## Decisions for the first review

- Approve primary and secondary as the core family, with quiet as a candidate?
- Keep the current pill-like corner shape, or compare it with a softly rounded shape before choosing one default?
- Begin with the proposed default geometry and a single LiftKit-inspired comparison, then add sizes only when a use case requires them?

All values above remain proposals until that visual review. The immediate deliverable is this plan; implementation follows as the next step.
