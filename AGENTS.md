# AGENTS.md

Repository-specific guidance for coding agents working on Svedit.

`README.md` is the user-facing manual and source of truth for setup, customization, and usage patterns. Consult only the relevant sections when working on those areas; keep agent-specific guidance here.

## Important constraints

- For code running from `/` in no-backend/Vercel mode, do not add top-level imports of backend-only modules such as `#app/api.remote.js` or anything that imports `#lib/server/db.js`.
- In home-route server files, import backend-only code lazily inside the `has_backend` guard so static deployments do not evaluate database code at module load time.
- Files using Svelte runes (`$state`, `$derived`, `$effect`, etc.) must use the `.svelte.js` or `.svelte.ts` extension.
- Use sentence case for documentation headings and comments; capitalize `Svedit` as a proper noun.

## Code style

- Use `snake_case` for project-defined JavaScript and TypeScript identifiers. Keep web platform and Svelte APIs in their native `camelCase` form.
- Prefer Tailwind classes and minimize custom CSS. For CSS custom properties, use Tailwind's arbitrary-value utilities, such as `text-(--editing)` and `border-(--editing)`, where applicable.

## Architecture

Svedit is a Svelte 5 rich content editor built around a graph-based document model.

- `Session` owns document state, transactions, and history; `Transaction` performs atomic changes.
- Documents are graphs of nodes with properties and references.
- Selection supports text, node, and property selections and maps between the model and the DOM.
- `Svedit.svelte` manages the editor and selection; `NodeArrayProperty.svelte` renders node sequences; `TextProperty.svelte` renders editable text with marks and annotations.

## Schema changes

When adding a property to a node type, update both:

1. `document_schema` in `src/app/document_schema.ts`
2. `inserters` in `src/app/document_config.ts`

## Svelte documentation tools

For Svelte or SvelteKit questions, use the Svelte MCP documentation tools:

1. Call `list-sections` first.
2. Use its `use_cases` information to identify all relevant sections.
3. Retrieve those sections with `get-documentation`.
4. When writing Svelte code, run `svelte-autofixer` and address all reported issues or suggestions before delivery.
