# Svedit

Svedit (think Svelte Edit) is a tiny library for building editable websites in Svelte. Model content in JSON, render it with custom components, and let site owners **edit directly in the layout** — no CMS needed.

- Try the [Svedit demo](https://svedit.dev) — watch the debug output at the bottom of the page
- Try [Editable Website](https://editable.website) — utilizes Svedit to enable CMS-free editable websites

## Why Svedit?

Because Svelte‘s reactivity system is **the perfect fit** for building super-lightweight content editing experiences. In fact, they're so lightweight, **your content is your editor** — no context switching between a backend and the live site. Svedit just gives you the gluing pieces around **defining a custom document model** and **mapping DOM selections** to the internal model and vice versa.

## Getting started

The fastest way to get started is to clone the `hello-svedit` template and turn it into your own project:

```bash
git clone https://github.com/michael/hello-svedit
cd hello-svedit
npm install
npm run dev
```

Now make it your own. The next thing you probably want to do is define your own [node types](./src/routes/create_demo_session.js), add a [Toolbar](./src/routes/components/Toolbar.svelte), and render custom [Overlays](./src/routes/components/Overlays.svelte). For that just get inspired by the [Svedit demo code](./src/routes).

You can also install Svedit into an existing SvelteKit project with `npm install svedit`, but you'll need to set up the session, schema, config, and components yourself. See the [hello-svedit repo](https://github.com/michael/hello-svedit) or this repo's [src/routes](./src/routes) for reference.

## Principles

**Simplicity over completeness:** Svedit doesn't guess what your app needs or offer ready-made blocks. Instead, we keep the core lean and provide carefully crafted examples showing how to build anything on top — without compromising flexibility.

**White-box library:** We expose the internals of the library to allow you to customize and extend it to your needs. That means a little bit more work upfront, but in return lets you control "everything" — the toolbar, the overlays, or how fast the node caret blinks.

**Chromeless canvas:** Svedit keeps the editing canvas chromeless, meaning there are no UI elements like toolbars or menus mingled with the content. You can interact with text directly, but everything else happens via tools shown in separate overlays or in the fixed toolbar.

**Native-first:** Svedit favors standardized native browser solutions over custom ones whenever possible — using browser-based rendering and the browser's selection APIs underneath, rather than reimplementing them (e.g. by building on [pretext](https://github.com/chenglou/pretext)). When we hit browser bugs, we try to get them fixed upstream (in collaboration with the W3C editing working group). Workarounds we add are intended to be temporary, until the underlying issue is fixed by browser vendors. And where we believe there's a better way to solve a problem than what's currently specified, we lobby for it to become a new (or improved) web standard.

## How it works

Svedit connects eight key pieces:

1. **Schema** - Define your content structure (node types, properties, marks, annotations)
2. **Document** - An actual document, containing a `document_id` and a flat map of nodes that hold the content
3. **Session** - Manages the document, selection state, and history
4. **Transaction** - Groups multiple document operations (create, delete, set) into a single atomic unit with undo/redo support
5. **Transforms** - Higher-level composable functions that run inside a transaction (e.g., `break_text_node`, `join_text_node`) to modify the document.
6. **Config** - Maps node types to components, provides inserters and commands
7. **Components** - Render your content using Svelte (one component per node type)
8. **Commands** - User actions (bold text, insert node, undo/redo) that modify the session

**The flow:**

- Define a schema → create a session → provide config → render with `<Svedit>` component
- User interactions trigger commands → commands create transactions → which run transforms to modify the document → session applies the transaction → Svelte's reactivity updates the UI
- Native DOM selections are mapped to Svedit's internal selection model

## Schema

You can use a simple JSON-compatible schema definition language to enforce constraints on your documents. E.g. to make sure a page node always has a property body with references to nodes that are allowed within a page.

First off, everything is a node. The page is a node, and so is a paragraph, a list, a list item, a nav and a nav item.

Each node has a `kind` that determines its behavior:

- `document`: A top-level node accessible via a route (e.g. a page, event)
- `block`: A structured node that contains other nodes or properties
- `text`: A node with editable text content (can be split and joined)
- `mark`: A content-level range applied to text or a node array (bold, link, section, etc.). Marks are mutually exclusive and render in-place.
- `annotation`: A metadata/overlay range applied to text or a node array (comments, markers, etc.). Annotations may overlap and are data-only.

### Choosing between `text` and `block`

`kind: 'text'` opts into the split/join system (`break_text_node`, `join_text_node`), which assumes:

- The node has exactly **one** `text` property named `content`
- Pressing Enter splits the node into two nodes of the same type
- Pressing Backspace at position 0 joins it with the previous node

If **any** of those assumptions don't hold, use `kind: 'block'`. Blocks can still have `text` properties with full editing support (typing, formatting, selection) — they just don't participate in split/join.

**Common mistake:** A quote node with `content` + `author` properties might seem like `kind: 'text'` because both fields are editable text. But splitting a quote into two half-quotes doesn't make sense, and `join_text_node` hard-codes `node.content` — so Backspace in the `author` field would join the wrong property with the previous block and drop the author text. The correct kind is `'block'`.

Properties of nodes can hold values:

- `string`: A good old JavaScript string
- `number`: Just like a number in JavaScript
- `integer`: A number for which Number.isInteger(number) returns true
- `boolean`: true or false
- `datetime`: A date/time string parseable by `Date.parse()`
- `string_array`: An array of strings
- `number_array`: An array of numbers
- `integer_array`: An array of integers
- `boolean_array`: An array of booleans
- `text`: Plain text content with marks (bold, italic, link etc.) and annotations (comments etc.). Text values use `{ content: '', marks: [], annotations: [] }`. Set `allow_newlines: true` to let users insert line breaks with Shift+Enter, or `false` to keep content single-line (e.g. for titles).

Or references:

- `node`: References a single node (e.g. an image node can reference a global asset node)
- `node_array`: References a sequence of nodes (e.g. page.body references paragraph and list nodes)

`node_array` properties use `node_types` for the child node types they can contain, plus optional `mark_types` for marks that can wrap ranges of child nodes and optional `annotation_types` for overlay annotations.

```js
const document_schema = {
	page: {
		kind: 'document',
		properties: {
			body: {
				type: 'node_array',
				node_types: ['nav', 'paragraph', 'list'],
				mark_types: ['section'],
				annotation_types: ['comment'],
				default_node_type: 'paragraph'
			}
		}
	},
	paragraph: {
		kind: 'text',
		properties: {
			content: {
				type: 'text',
				mark_types: ['strong', 'emphasis', 'link'],
				annotation_types: ['comment'],
				allow_newlines: true
			}
		}
	},
	list_item: {
		kind: 'text',
		properties: {
			content: {
				type: 'text',
				mark_types: ['strong', 'emphasis', 'link'],
				allow_newlines: true
			}
		}
	},
	list: {
		kind: 'block',
		properties: {
			list_items: {
				type: 'node_array',
				node_types: ['list_item'],
				default_node_type: 'list_item'
			}
		}
	},
	nav: {
		kind: 'block',
		properties: {
			nav_items: {
				type: 'node_array',
				node_types: ['nav_item'],
				default_node_type: 'nav_item'
			}
		}
	},
	nav_item: {
		kind: 'block',
		properties: {
			url: { type: 'string' },
			label: { type: 'string' }
		}
	},
	strong: {
		kind: 'mark',
		properties: {}
	},
	emphasis: {
		kind: 'mark',
		properties: {}
	},
	link: {
		kind: 'mark',
		properties: {
			href: { type: 'string' }
		}
	},
	section: {
		kind: 'mark',
		properties: {}
	},
	comment: {
		kind: 'annotation',
		properties: {}
	}
};
```

Mark types are defined as nodes with `kind: 'mark'`, annotation types as nodes with `kind: 'annotation'`. Simple marks like `strong` and `emphasis` have no properties, while marks like `link` can carry data (e.g. `href`). Each `text` or `node_array` property specifies which types are allowed via `mark_types` and `annotation_types` — this lets you control formatting per property (e.g. allow bold and links in body text, but only emphasis in titles). `mark_types` may only reference `kind: 'mark'` node types and `annotation_types` only `kind: 'annotation'` node types.

## Document

A document is a plain JavaScript object (POJO) with a `document_id` (the entry point) and a `nodes` object containing all content nodes.

Rules:

- All nodes must be reachable from the document node (unreachable nodes are discarded)
- No cyclic references allowed
- Text properties use `{ content: '', marks: [], annotations: [] }`
- Node array properties use `{ nodes: [], marks: [], annotations: [] }`

### Node IDs

Node IDs uniquely identify nodes inside a document. They are also used whenever one node references another node, for example in `node`, `node_array.nodes`, and mark or annotation `node_id` values.

Because Svedit also uses these IDs in HTML ids, document paths, and CSS selectors, IDs need to follow a simple, safe format:

- It must be a string.
- It must not be empty.
- It must start with a letter (`A-Z`, `a-z`) or underscore (`_`).
- After the first character, it may contain letters, numbers, underscores, or dashes.
- It must not contain Svedit's path separator `__`.

Valid examples:

```js
'page_1';
'story-hero';
'_temporary_node';
```

Invalid examples:

| ID          | Why invalid                                         |
| ----------- | --------------------------------------------------- |
| `1`         | Not a string                                        |
| `'1'`       | Serialized paths would treat this as an array index |
| `'1_page'`  | Starts with a number                                |
| `'page.1'`  | `.` is not allowed                                  |
| `'page__1'` | `__` is reserved as Svedit's path separator         |

The `doc.nodes` map key must also match the node's own `id`:

```js
nodes: {
	page_1: {
		id: 'page_1',
		type: 'page'
		// ...
	}
}
```

If you provide `config.generate_id`, every generated ID must follow the same rules. Svedit validates generated IDs immediately and throws if the provider returns an invalid value:

```js
const session_config = {
	generate_id: () => `node_${crypto.randomUUID()}`
};
```

Provide your own generator: use short custom-alphabet `nanoid` IDs for local documents, monotonic ULIDs (`ulid`) for sortable/synced IDs, or prefixed UUIDs for globally unique IDs.

Here's an example document:

```js
const doc = {
	document_id: 'page_1',
	nodes: {
		strong_1: {
			id: 'strong_1',
			type: 'strong'
		},
		section_1: {
			id: 'section_1',
			type: 'section'
		},
		nav_item_1: {
			id: 'nav_item_1',
			type: 'nav_item',
			url: '/homepage',
			label: 'Home'
		},
		nav_1: {
			id: 'nav_1',
			type: 'nav',
			nav_items: { nodes: ['nav_item_1'], marks: [], annotations: [] }
		},
		paragraph_1: {
			id: 'paragraph_1',
			type: 'paragraph',
			content: {
				content: 'Hello world.',
				marks: [{ start_offset: 0, end_offset: 5, node_id: 'strong_1' }],
				annotations: []
			}
		},
		list_item_1: {
			id: 'list_item_1',
			type: 'list_item',
			content: { content: 'First list item', marks: [], annotations: [] }
		},
		list_item_2: {
			id: 'list_item_2',
			type: 'list_item',
			content: { content: 'Second list item', marks: [], annotations: [] }
		},
		list_1: {
			id: 'list_1',
			type: 'list',
			list_items: { nodes: ['list_item_1', 'list_item_2'], marks: [], annotations: [] }
		},
		page_1: {
			id: 'page_1',
			type: 'page',
			body: {
				nodes: ['nav_1', 'paragraph_1', 'list_1'],
				marks: [{ start_offset: 1, end_offset: 3, node_id: 'section_1' }],
				annotations: []
			}
		}
	}
};
```

### Marks and annotations

Marks and annotations are regular nodes attached to a range in a property value. Both use the same attachment shape:

```js
{
	start_offset: 0,
	end_offset: 5,
	node_id: 'strong_1'
}
```

They differ in semantics:

- **Marks** are part of the content (bold, italic, link, section). They are mutually exclusive within a property and are rendered in-place by `<TextProperty>`/`<NodeArrayProperty>`.
- **Annotations** are metadata layered over the content (comments, markers). They may overlap marks and each other, and are data-only: Svedit keeps and transforms the data (and adds CSS classes to covered node wrappers), but your app is responsible for interpreting it. Annotation types must not have registered components.

For `text` properties, offsets address character positions in the `content` string:

```js
{
	id: 'paragraph_1',
	type: 'paragraph',
	content: {
		content: 'Hello world.',
		marks: [{ start_offset: 0, end_offset: 5, node_id: 'strong_1' }],
		annotations: [{ start_offset: 3, end_offset: 8, node_id: 'comment_1' }]
	}
}
```

For `node_array` properties, offsets address node positions in the `nodes` array. This lets you wrap a contiguous group of child nodes with the same range model:

```js
{
	id: 'page_1',
	type: 'page',
	body: {
		nodes: ['paragraph_1', 'paragraph_2', 'paragraph_3'],
		marks: [{ start_offset: 1, end_offset: 3, node_id: 'section_1' }],
		annotations: []
	}
}
```

The ranges are half-open: `start_offset` is included, `end_offset` is excluded. Marks must not overlap; annotations may overlap (including same-type annotations created through lower-level APIs).

### Document schema changes

Svedit validates documents against the current schema when you create a `Session`. If you change the schema, you are responsible for migrating existing documents before loading them.

For simple additive changes, defaults can help. When you add a new property, you can call `fill_document_defaults` before creating the session:

```js
import { Session, fill_document_defaults } from 'svedit';

const document_schema = {
	paragraph: {
		kind: 'text',
		properties: {
			layout: { type: 'integer', default: 1 },
			content: {
				type: 'text',
				allow_newlines: true
			}
		}
	}
};

const migrated_doc = fill_document_defaults(existing_doc, document_schema);
const session = new Session(document_schema, migrated_doc, config);
```

This only fills properties that are missing. Explicit schema `default` values are used when present; otherwise Svedit uses built-in defaults for value types such as strings, numbers, booleans, arrays, `node_array`, and `text`. Existing values are preserved, and the original document object is not mutated.

Defaults make it safe to add new defaultable properties, but they are not a replacement for real document migrations. If you rename a property, remove a property, split one property into several, change node types, or need to transform existing data, write your own migration first and use `fill_document_defaults` only as a helper where appropriate.

`tr.create` and `tr.build` also fill omitted defaults for newly-created nodes. For document migrations, declare explicit defaults whenever the built-in type default is not the value you want. Do not rely on default filling for schema changes that need a real migration.

## Config

Documents need a config object that tells Svedit how to render and manipulate your content. See the full example in [src/routes/create_demo_session.js](src/routes/create_demo_session.js).

Two optional hooks are especially useful when integrating custom media workflows:

- `handle_media_paste(session, pasted_media)` Called when media is pasted. You can upload/process files, replace an existing media property, or return a node payload to insert new content. See example implementation in [src/routes/create_demo_session.js](src/routes/create_demo_session.js).
- `handle_property_deletion(session, path)` Called when deleting/cutting a property selection. Use it to define app-specific reset behavior (for example clearing an image property or resetting a referenced media node).  
  See example implementation in [src/routes/create_demo_session.js](src/routes/create_demo_session.js).

```js
const session_config = {
  // ID generator for creating new nodes
  generate_id: () => nanoid(),

  // User-land overlays and optional system component overrides
  system_components: { overlays: Overlays },

  // Map node types to Svelte components
  node_components: { page: Page, text: Text, story: Story, list: List, button: Button, ... },

  // Functions that create and insert new nodes
  inserters: {
    text: (tr, content = { content: '', marks: [], annotations: [] }) => {
      const text_id = nanoid();
      tr.create({ id: text_id, type: 'text', content });
      tr.insert_nodes([text_id]);
    }
  },

  // Returns { commands, keymap } for the editor instance
  create_commands_and_keymap: (context) => { ... },

  // Optional: handle image paste events
  handle_image_paste: (session, images) => { ... }
};
```

**Key config options:**

- `generate_id` - Function that generates unique IDs for new nodes
- `node_components` - Maps each node type from your schema to a Svelte component
- `system_components` - Optional overrides for internal editor components and a slot for your own overlays:
  `overlays` — A Svelte component rendered inside `<Svedit>` but outside the content canvas. Use it to add floating UI like link editors, image toolbars, or annotation popovers that appear near the current selection. See [src/routes/components/Overlays.svelte](src/routes/components/Overlays.svelte) for an example.
  `node_gap`, `node_gap_markers`, `node_selection_markers` — Override the default system components if you need custom visuals for node gaps or selection indicators.
- `inserters` - Functions that create blank nodes of each type and set up the selection
- `create_commands_and_keymap` - Factory function that creates commands and keybindings for an editor instance
- `handle_image_paste` - Optional handler for image paste events
- `view_classes` - Viewport visibility classes. Every node element gets `.in-view`, `.seen`, `.fully-in-view`, `.visible-top`, `.visible-bottom` toggled as it scrolls through the viewport. Useful for scrollytelling and reveal animations driven from CSS. **On by default**. Set `view_classes: false` to opt out — saves ~5 classList ops per IO entry (measurable scroll-FPS win at 200+ nodes) and narrows the IntersectionObserver thresholds from `[0, 0.98]` to `[0]` (halves callback frequency during scroll). Disable if your app doesn't read these classes from CSS.

The config is accessible throughout your app via `session.config`.

## Session

The `Session` class manages your content graph, selection state, and history. See [src/lib/Session.svelte.js](src/lib/Session.svelte.js) for the full API.

### Immutable state

Document content (`session.doc`) and selection (`session.selection`) are **immutable** with **copy-on-write** semantics. When a change is made, only the modified parts are copied — unchanged nodes keep their original references. This avoids the overhead of reactive proxies (using Svelte's `$state.raw`) since state is reassigned rather than mutated. Also, `console.log(session.get(some_node_id))` gives you a readable raw object, not a proxy.

### Creating a session

```js
import { Session } from 'svedit';

const session = new Session(schema, doc, config);
```

### Reading the graph

```js
session.get(['page_1', 'body']); // => { nodes: ['nav_1', 'paragraph_1', 'list_1'], marks: [], annotations: [] }
session.get(['nav_1']); // => { id: 'nav_1', type: 'nav', ... }
session.get('nav_1'); // => shorthand for above (single node ID)
session.inspect(['page_1', 'body']); // => { kind: 'property', type: 'node_array', node_types: [...] }
session.kind(node); // => 'text', 'block', 'mark', or 'annotation'
```

### Selection and state

```js
session.selection; // Current selection (text, node, or property)
session.selected_node; // The currently selected node (derived)
session.selected_marks; // Mark records touched by the current selection (derived)
session.active_mark; // The selected mark record when exactly one mark is touched, otherwise null
session.selected_annotations; // Annotation records touched by the current selection (derived)
session.active_annotation; // The selected annotation record when exactly one annotation is touched, otherwise null
session.can_insert('paragraph'); // Check if node type can be inserted
session.available_mark_types; // Mark types allowed at current selection (derived)
session.available_annotation_types; // Annotation types allowed at current selection (derived)
```

#### Native selection as source of truth

Every selection that can exist in Svedit must have a DOM representation. This is a core design decision: the browser's native selection determines where the selection is, and `session.selection` is derived from it — not the other way around. If the DOM selection stops being the source of truth, selection mapping becomes ambiguous and Svedit loses the simplicity and determinism that the editor is built on.

This applies to all selection types:

- Text selections are native selections inside a `text` property.
- Node selections are native selections whose anchor and focus land inside the selected node range.
- Property selections are native selections inside the DOM representation of that property.

For example, a multi-node selection is still represented as a native browser selection that starts somewhere inside one node and ends somewhere inside another. Svedit maps that DOM selection to an internal node selection, hides the browser's visual selection, and renders `NodeSelectionMarkers` instead. The native selection remains in the DOM behind the scenes because `contenteditable` still needs it to do its job: pressing an arrow key should move the cursor from the current focus point to the closest valid next position, and Shift+Arrow should expand the selection from that same focus point. Without a native selection rendered at all times, the browser has no reliable starting point for cursor movement, selection expansion, or other editing behavior.

### Making changes

```js
const tr = session.tr; // Create a transaction
tr.set(['nav_1', 'label'], 'Home');
tr.insert_nodes(['new_node_id']);
session.apply(tr); // Apply the transaction
```

#### Batching history entries

By default, every `session.apply(tr)` creates a new undo/redo entry. Pass `{ batch: true }` to merge the transaction into the previous history entry instead — useful for continuous interactions like dragging, where you want the entire gesture to undo as one step.

```js
session.apply(tr, { batch: true });
```

Batched transactions merge into the current history entry as long as they arrive within a 2-second window of the batch start. After 2 seconds of inactivity, the next `apply` starts a fresh entry. To force a new entry immediately (e.g. on pointer up), reset the batch timer:

```js
session.last_batch_started = undefined;
```

### History

```js
session.can_undo; // Boolean (derived)
session.can_redo; // Boolean (derived)
session.undo();
session.redo();
```

### Detecting unsaved changes

Because document state is immutable, you can detect unsaved changes by comparing references. When a change is made, `session.doc` gets a new reference — unchanged documents keep the same reference.

```js
let last_saved_doc = $state(null);
let has_unsaved_changes = $derived.by(() => {
	if (!last_saved_doc) {
		// No save yet — use undo history as indicator
		return session.can_undo;
	} else {
		// Compare current doc reference against last saved
		return last_saved_doc !== session.doc;
	}
});

function save() {
	// ... save to server ...
	last_saved_doc = session.doc;
}
```

This works because of Svedit's copy-on-write strategy: only modified parts of the document are copied, so reference equality is a reliable and efficient way to detect changes. You can use `has_unsaved_changes` to show/hide a save button, display a dirty indicator, or warn before navigating away.

### Utilities

```js
session.doc.document_id; // The document's root ID
session.generate_id(); // Generate a new unique ID
session.config; // Access the config object
session.validate_doc(); // Validate all nodes against schema
session.traverse(node_id); // Get all nodes reachable from a node
session.select_parent(); // Select parent of current selection
```

## Transforms

Transforms are pure functions that modify a transaction. They encapsulate common editing operations like breaking text nodes, joining nodes, or inserting new content.

Transforms take a transaction (`tr`) as their parameter and return `true` if successful or `false` if the transform cannot be applied (e.g., wrong selection type or invalid state).

```js
// Example: break a text node at the caret
import { break_text_node } from 'svedit';

const tr = session.tr;
const success = break_text_node(tr);
if (success) {
	session.apply(tr);
}
```

### Built-in transforms

Svedit provides several core transforms in [src/lib/transforms.svelte.js](src/lib/transforms.svelte.js):

- `break_text_node(tr)` - Split a text node at the caret position
- `join_text_node(tr)` - Join current text node with the previous one
- `insert_default_node(tr)` - Insert a new node at the current selection

### Composability

Transforms are composable. You can build higher-level transforms from lower-level ones:

```js
function custom_transform(tr) {
	// Compose multiple transforms
	if (!break_text_node(tr)) return false;
	if (!insert_default_node(tr)) return false;
	return true;
}
```

### Writing your own transforms

You're encouraged to write custom transforms for your application's specific needs. Keep them pure functions that operate on the transaction object:

```js
function insert_heading(tr) {
	const selection = tr.selection;

	if (selection?.type !== 'node') return false;

	// Create and insert a heading node
	const heading_id = tr.generate_id();
	tr.create({ id: heading_id, type: 'heading', content: { content: '', marks: [], annotations: [] } });
	tr.insert_nodes([heading_id]);

	return true;
}
```

## Transaction

Transactions group multiple operations into atomic units that can be applied and undone as one. They provide the same read API as sessions (`tr.get()`, `tr.inspect()`, `tr.kind()`, `tr.generate_id()`), so transforms can query document state directly. See [src/lib/Transaction.svelte.js](src/lib/Transaction.svelte.js) for the full API.

### Basic usage

```js
const tr = session.tr; // Create a new transaction
tr.set(['node_1', 'title'], 'New Title'); // Modify properties
session.apply(tr); // Apply atomically
```

### Node operations

```js
// Create a new node (must include all required properties from schema)
tr.create({ id: 'paragraph_1', type: 'paragraph', content: { content: '', marks: [], annotations: [] } });

// Delete a node (cascades to unreferenced child nodes)
tr.delete('paragraph_26');

// Insert nodes at current node selection
tr.insert_nodes(['paragraph_1', 'list_1']);

// Build a subgraph from existing nodes (generates new IDs)
const new_node_id = tr.build('the_list', {
	first_item: {
		id: 'first_item',
		type: 'list_item',
		content: node.content
	},
	the_list: {
		id: 'the_list',
		type: 'list',
		list_items: { nodes: ['first_item'], marks: [], annotations: [] }
	}
});
```

### Text operations

```js
// Insert text at caret (replaces selection if expanded)
tr.insert_text('Hello');

// Toggle mark on selected text (marks are mutually exclusive)
tr.toggle_mark('strong');
tr.toggle_mark('link', { href: 'https://example.com' });

// Toggle annotation on selected text (competes only with same-type annotations)
tr.toggle_annotation('comment');

// Delete selected text or nodes
tr.delete_selection();
```

### Selection

```js
// Set the selection after operations
tr.set_selection({
	type: 'text',
	path: ['node_1', 'content'],
	anchor_offset: 0,
	focus_offset: 5
});
```

All transaction methods return `this` for chaining:

```js
tr.create(node).insert_nodes([node.id]).set_selection(new_selection);
```

## Commands

Commands provide a structured way to implement user actions. Commands are stateful and UI-aware, unlike transforms which are pure functions.

There are two types of commands in Svedit:

- **Document-scoped commands** - Bound to a specific Svedit instance/document and only active when that editor has focus
- **App-level commands** - Operate at the application level, independent of any specific document

Let's start with document-scoped commands, which are the foundation of the editing experience.

### Document-scoped commands

Document-scoped commands operate on a specific document and have access to its selection, content, and editing state through a context object.

#### Creating a document-scoped command

Extend the `Command` base class and implement the `is_enabled()` and `execute()` methods:

```js
import { Command } from 'svedit';

class ToggleStrongCommand extends Command {
	is_enabled() {
		return this.context.editable && this.context.session.selection?.type === 'text';
	}

	execute() {
		this.context.session.apply(this.context.session.tr.toggle_mark('strong'));
	}
}
```

#### Document command context

Document-scoped commands receive a `context` object with access to the Svedit instance's state:

- `context.session` - The current session instance
- `context.editable` - Whether the editor is in edit mode
- `context.canvas_el` - The DOM element of the Svedit editor canvas
- `context.is_composing` - Whether IME composition is currently taking place

### Command lifecycle methods

`is_enabled(): boolean`

Determines if the command can currently be executed. This is automatically evaluated and exposed as the `disabled` derived property, which can be used to disable UI elements.

```js
is_enabled() {
  return this.context.editable && this.context.session.selection?.type === 'text';
}
```

`execute(): void | Promise<void>`

Executes the command's action. Can be synchronous or asynchronous.

```js
execute() {
  const tr = this.context.session.tr;
  tr.insert_text('Hello');
  this.context.session.apply(tr);
}
```

#### Built-in document commands

Svedit provides several [core commands](src/lib/Command.svelte.js) out of the box:

- `UndoCommand` - Undo the last change
- `RedoCommand` - Redo the last undone change
- `SelectParentCommand` - Select the parent of the current selection
- `ToggleMarkCommand` - Toggle marks on text or node-array selections
- `ToggleAnnotationCommand` - Toggle annotations on text or node-array selections
- `AddNewLineCommand` - Insert newline character in text
- `BreakTextNodeCommand` - Split text node at caret
- `SelectAllCommand` - Progressively expand selection
- `InsertDefaultNodeCommand` - Insert a new node at caret

#### Using document commands

Commands are created by passing them a context object from the Svedit component. See a complete example in [src/routes/create_demo_session.js](src/routes/create_demo_session.js) in the `create_commands_and_keymap` configuration function:

```js
create_commands_and_keymap: (context) => {
	const commands = {
		undo: new UndoCommand(context),
		redo: new RedoCommand(context),
		toggle_strong: new ToggleMarkCommand('strong', context),
		toggle_emphasis: new ToggleMarkCommand('emphasis', context)
		// ... more commands
	};

	const keymap = define_keymap({
		'meta+z,ctrl+z': [commands.undo],
		'meta+b,ctrl+b': [commands.toggle_strong]
		// ... more keybindings
	});

	return { commands, keymap };
};
```

Bind commands to UI elements in your components:

```svelte
<button
	disabled={document_commands.toggle_strong.disabled}
	class:active={document_commands.toggle_strong.active}
	onclick={() => document_commands.toggle_strong.execute()}
>
	Bold
</button>
```

#### Derived state in commands

Commands can have derived state for reactive UI binding. The `active` property in toggle commands is a common pattern:

```js
class ToggleEmphasisCommand extends Command {
	// Automatically recomputes when mark state changes
	active = $derived(this.context.session.active_mark?.node.type === 'emphasis');

	is_enabled() {
		return this.context.editable && this.context.session.selection?.type === 'text';
	}

	execute() {
		this.context.session.apply(this.context.session.tr.toggle_mark('emphasis'));
	}
}
```

The `disabled` property is automatically derived from `is_enabled()` on all commands.

#### DOM access in commands

Commands can access the DOM through the context or global APIs:

```js
class FocusNextSelectableCommand extends Command {
	execute() {
		const selectables = this.context.canvas_el.querySelectorAll('.svedit-selectable');
		const next = selectables[0]; // Find next based on current selection
		const path = next.closest('[data-path]').dataset.path.split('.');
		this.context.session.selection = { type: 'text', path, anchor_offset: 0, focus_offset: 0 };
	}
}
```

### App-level commands and scope hierarchy

While document-scoped commands operate on a specific Svedit instance, app-level commands operate at the application level and handle concerns like saving, loading, switching between edit/view modes, or managing multiple documents.

#### Understanding the scope stack

Svedit uses a scope hierarchy (scope stack) to manage which commands are active at any given time:

1. **App-level scope** (top level) - Commands that are always available, independent of document focus
2. **Document-level scope** (per Svedit instance) - Commands bound to a specific document/editor

When a Svedit instance gains focus:

- The previous document's scope is **popped** from the stack (its commands become inactive)
- The newly focused document's scope is **pushed** onto the stack (its commands become active)

This means commands automatically work with the correct document based on focus.

#### Creating app-level commands

App-level commands have their own context, separate from any specific document:

```js
import { Command } from 'svedit';

class SaveCommand extends Command {
	is_enabled() {
		return this.context.editable;
	}

	async execute() {
		await this.context.save_all_documents();
		this.context.show_notification('All changes saved');
	}
}

class ToggleEditModeCommand extends Command {
	is_enabled() {
		return !this.context.editable;
	}

	execute() {
		this.context.editable = true;
	}
}
```

#### App-level context

The app-level context contains application-wide state and methods:

```js
const app_context = {
	get editable() {
		return editable; // App-level editable state
	},
	set editable(value) {
		editable = value;
	},
	get session() {
		return session;
	},
	get app_el() {
		return app_el;
	}
};

const app_commands = {
	save: new SaveCommand(app_context),
	toggle_edit: new ToggleEditCommand(app_context)
};
```

## Scope-aware keyboard shortcuts

The KeyMapper manages keyboard shortcuts using a scope-based stack system. Scopes are tried from top to bottom (most recent to least recent), allowing more specific keymaps to override general ones.

### Basic usage

```js
import { KeyMapper, define_keymap } from 'svedit';

const key_mapper = new KeyMapper();

// Define a keymap
const keymap = define_keymap({
	'meta+z,ctrl+z': [document_commands.undo],
	'meta+b,ctrl+b': [document_commands.bold],
	enter: [document_commands.break_text_node]
});

// Push the keymap onto the scope stack
key_mapper.push_scope(keymap);

// Handle keydown events
window.addEventListener('keydown', (event) => {
	key_mapper.handle_keydown(event);
});
```

### Key syntax

- **Multiple modifiers**: `meta+shift+z`, `ctrl+alt+k`
- **Cross-platform**: `meta+z,ctrl+z` (tries Meta+Z first, then Ctrl+Z)
- **Modifiers**: `meta`, `ctrl`, `alt`, `shift`
- **Keys**: Any key name (e.g., `a`, `enter`, `escape`, `arrowup`)

### Command arrays

Commands are wrapped in arrays to support fallback behavior:

```js
define_keymap({
	'meta+b,ctrl+b': [
		document_commands.bold, // Try this first
		document_commands.fallback // Use this if first is disabled
	]
});
```

### Scope stack

Use `push_scope()` and `pop_scope()` to manage different keyboard contexts:

```js
// App-level keymap (always active)
const app_keymap = define_keymap({
	'meta+s,ctrl+s': [app_commands.save],
	'meta+n,ctrl+n': [app_commands.new_document]
});
key_mapper.push_scope(app_keymap);

// Document-level keymap (active when editor has focus)
const doc_keymap = define_keymap({
	'meta+z,ctrl+z': [document_commands.undo],
	'meta+b,ctrl+b': [document_commands.bold]
});

// When editor gains focus:
key_mapper.push_scope(doc_keymap);

// When editor loses focus:
key_mapper.pop_scope();
```

The KeyMapper tries scopes from top to bottom, so push more specific keymaps last.

## Selection

Selections are at the heart of Svedit. There are just three types of selections:

### Terminology note

- Use "node" as the domain term.
- Use "node caret" for a collapsed node selection.
- Use "node gap" for the DOM landing zone between nodes.

1. **Text Selection**: A text selection spans across a range of characters in a string. E.g. the below example has a collapsed caret at position 1 in a text property 'content'.

```js
{
  type: 'text',
  path: ['page_1234', 'body', 0, 'content'],
  anchor_offset: 1,
  focus_offset: 1
}
```

2. **Node Selection**: A node selection spans across a range of nodes inside a node_array. The below example selects the nodes at index 3 and 4.

```js
{
  type: 'node',
  path: ['page_1234', 'body'],
  anchor_offset: 2,
  focus_offset: 4
}
```

3. **Property Selection**: A property selection addresses one particular property of a node.

```js
{
  type: "property",
  path: [
    "page_1",
    "body",
    11,
    "image"
  ]
}
```

You can access the current selection through `session.selection` anytime. And you can programmatically set the selection using `session.selection = new_selection`.

## Rendering

Now you can start making your Svelte pages in-place editable by wrapping your design inside the `<Svedit>` component.

```svelte
<Svedit {session} path={[session.doc.document_id]} editable={true} />
```

## Node components

Node components are Svelte components that render specific node types in your document. Each node component receives a `path` prop and uses the `<Node>` wrapper component along with property components to render the node's content.

### Basic structure

A typical node component follows this pattern:

```svelte
<script>
	import { Node, TextProperty } from 'svedit';
	let { path } = $props();
</script>

<Node {path}>
	<div class="my-node">
		<TextProperty path={[...path, 'content']} />
	</div>
</Node>
```

### The `<Node>` wrapper

Every node component must wrap its content in the `<Node>` component. This wrapper:

- Registers the node with the editor
- Handles selection and caret behavior
- Provides the foundation for editing interactions

### Property components

Svedit provides specialized components for rendering different property types:

`<TextProperty>` - For editable text content with inline marks:

```svelte
<TextProperty tag="p" class="body" path={[...path, 'content']} placeholder="Enter text here" />
```

`<NodeArrayProperty>` - For container properties that hold multiple nodes:

```svelte
<NodeArrayProperty class="list-items" path={[...path, 'list_items']} />
```

Node arrays can also carry marks and annotations when their schema includes `mark_types`/`annotation_types`. The value still has one `nodes` array, plus `marks` and `annotations` arrays whose offsets refer to node indexes:

```js
buttons: {
	nodes: ['button_1', 'button_2', 'button_3'],
	marks: [{ start_offset: 0, end_offset: 2, node_id: 'section_1' }],
	annotations: []
}
```

`<NodeArrayProperty>` wraps marked ranges with the matching mark component, just like `<TextProperty>` does for text ranges. Child node components also receive range context:

```svelte
<script>
	let { path, mark: section = null, annotations = [] } = $props();
</script>

<div class:section-start={section?.is_start}>
	<!-- render node content -->
</div>
```

`mark` is the mark wrapping the child node, or `null` when none does — mark exclusivity guarantees there is at most one. `annotations` contains all annotations covering the child node, including overlapping ones. Annotations are data-only: they never wrap and are never rendered as components. Each entry contains the flattened attachment plus context for the current child node: `start_offset`, `end_offset`, `node_id`, `index`, `node`, `is_start`, `is_middle`, `is_end`. `node` is the resolved mark or annotation node, `index` is the position in the parent `marks`/`annotations` array, and the `is_*` flags describe the current child node's position in the attached range.

For styling, you usually don't need the props at all: `<Node>` adds range classes to the node wrapper automatically. A node covered by a `section` mark gets `mark-section`, a node covered by a `marker` annotation gets `anno-marker` — plus `-start`/`-end` variants on the run's first/last covered node. So styling a mark or annotation type — including types without a component — is pure CSS:

```css
.anno-marker {
	background: color-mix(in oklch, var(--app-primary-fill) 13%, transparent);
}
```

Use the `annotations` prop only when a component should render something richer than styles (badges, margin indicators, etc.).

**One path = one DOM mount.** Within a single Svedit document, each node path
may be mounted exactly once. Mounting the same path twice (e.g. rendering the
same `nav_items` array in both header and footer) breaks anchor positioning,
intersection tracking, id uniqueness, and selection mapping.
Svedit logs an error if it detects a duplicate mount.

If you need to render shared content in multiple places, model it as distinct
node_arrays (`header_nav`, `footer_nav`) in the same document, or render it
from a separate Svedit instance.

`<CustomProperty>` - For custom properties like images or other non-text content:

```svelte
<CustomProperty class="image-wrapper" path={[...path, 'image']}>
	<div contenteditable="false">
		<img src={node.image} alt={node.title.content} />
	</div>
</CustomProperty>
```

### Accessing node data

Use the Svedit context to access node data:

```svelte
<script>
	import { getContext } from 'svelte';
	const svedit = getContext('svedit');

	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);
</script>
```

### Example: Text component

Here's a complete example of a text node component that supports multiple layouts:

```svelte
<script>
	import { getContext } from 'svelte';
	import { Node, TextProperty } from 'svedit';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);
	let tag = $derived(layout === 1 ? 'p' : `h${layout - 1}`);
</script>

<Node {path}>
	<div class="text layout-{layout}">
		<TextProperty {tag} class="body" path={[...path, 'content']} placeholder="Enter text" />
	</div>
</Node>
```

### Example: List component

A simple list component that renders child items:

```svelte
<script>
	import { Node, NodeArrayProperty } from 'svedit';
	let { path } = $props();
</script>

<Node {path}>
	<div class="list">
		<NodeArrayProperty path={[...path, 'list_items']} />
	</div>
</Node>
```

### Registering node components

Node components are registered in the document config's `node_components` map:

```js
const session_config = {
	node_components: {
		text: Text,
		story: Story,
		list: List,
		list_item: ListItem
		// ... other components
	}
};
```

The keys must be the snake_case node types in your schema. Svedit looks up node components directly by node type, so a node with `type: "list_item"` will look for a component registered as `list_item`.

## Mastering contenteditable

Svedit relies on the contenteditable attribute to make elements editable. The below example shows you
a simplified version of the markup of `<NodeGap>` and why it is implemented the way it is.

```html
<div contenteditable="true">
	<div class="some-wrapper">
		<!--
      Putting a <br> tag into a div gives you a single addressable caret position.

      Adding a &ZeroWidthSpace; (or any character) here will lead to 2 caret
      positions (one before, and one after the character)

      Using <wbr> will make it only addressable for ArrowLeft and ArrowRight, but not ArrowUp and ArrowDown.
      And using <span></span> will not make it addressable at all.

      Svedit uses this behavior for node gaps, and when an
      <TextProperty> is empty.
    -->
		<div class="node-gap"><br /></div>
		<!--
      If you create a contenteditable="false" island, there needs to be some content in it,
      otherwise it will create two additional caret positions. One before, and another one
      after the island.

      The Svedit demo uses this technique in `<NodeGap>` to create a node-caret
      visualization, that doesn't mess with the contenteditable caret positions.
    -->
		<div contenteditable="false" class="node-caret">&ZeroWidthSpace;</div>
	</div>
</div>
```

Further things to consider:

- If you make a sub-tree `contenteditable="false"`, be aware that you can't create a `contenteditable="true"` segment somewhere inside it. Svedit can only work reliably when there's one contenteditable="true" at root (it's set by `<Svedit`>)
- `<TextProperty>` and `<CustomProperty>` must not be wrapped in `contenteditable="false"` to work properly.
- Never apply `position: relative` to the direct parent of `<TextProperty>`, it will cause a [weird Safari bug](https://bsky.app/profile/michaelaufreiter.com/post/3lxvdqyxc622s) to destroy the DOM.
- Never apply `position: relative`, `position: absolute`, `position: fixed` to `<Node.svelte>` (data-type="node") in edit mode. Only `position: static` is permitted to allow css anchor positioning queries to resolve correctly.
- Never use an `<a>` tag inside a `contenteditable="true"` element, as it will cause unexpected behavior. Make it a `<div>` while editing, and an `<a>` in read-only mode (when `svedit.editable` is `false` ).
- Avoid adding css `margin` to nodes inside node arrays when using flex or grid layouts. Use `gap` on the container instead. This ensures `NodeGap` and `NodeGapMarkers` render consistently. If you need to add a margin, add it to a child element of Node.

### Consistent DOM structure across modes

`<NodeArrayProperty>` always renders a `.node-gap` element before each node, regardless of whether the editor is in edit or read-only mode. In edit mode, this is the full `<NodeGap>` component with anchor positioning, hit areas, and caret support. In read-only mode, it's a plain `<div class="node-gap"></div>`.

This means the DOM structure is identical in both modes:

```html
<!-- Same structure in edit and read-only mode -->
<div data-type="node_array">
	<div class="node-gap">...</div>
	<!-- First element is a node-gap -->
	<div data-type="node"><!-- first node --></div>
	<div class="node-gap">...</div>
	<div data-type="node"><!-- second node --></div>
	...
	<div class="node-gap">...</div>
	<!-- Last element is a node-gap -->
</div>
```

The `.node-gap` element uses `display: contents`, so it has no layout impact — it doesn't generate a box, doesn't affect flex/grid item counts, and doesn't consume space. It only serves as a DOM placeholder for consistent selector targeting.

Because `.node-gap` is always the actual first and last child, do not use `:first-child` or `:last-child` on nodes — they will never match. Use `:nth-child(1 of [data-type="node"])` and `:nth-last-child(1 of [data-type="node"])` instead.

CSS sibling selectors that target node adjacency only need one form:

```css
/* Works in both edit and read-only mode */
.node-text + .node-gap + .node-media {
	margin-block-start: 1rem;
}
```

For `:nth-child` selectors, use the `of <selector>` syntax to skip over `.node-gap` elements and count only nodes:

```css
/* Even nodes */
.list-node-array > :nth-child(2n of [data-type='node']) {
	background: var(--zebra-stripe);
}

/* Odd nodes */
.list-node-array > :nth-child(2n-1 of [data-type='node']) {
	background: var(--zebra-stripe);
}

/* Last node */
.list-node-array > :nth-last-child(1 of [data-type='node']) {
	border-bottom: none;
}
```

Without the `of` filter, plain `:nth-child(even)` would count `.node-gap` divs and produce incorrect results. The [of selector](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:nth-child#syntax) form is Baseline 2023 and supported in all modern browsers.

### Node array CSS tokens

`<NodeArrayProperty>` renders a `[data-type="node_array"]` element. Two CSS custom properties control how gaps and carets behave inside it:

`--row` — Tell Svedit whether a node array flows horizontally (`1`) or vertically (`0`). Gaps, carets, and markers all switch orientation accordingly. Defaults to `0` on the Svedit canvas. Set it on the node array or an ancestor:

```css
.my-horizontal-layout :global(.grid-items) {
	--row: 1;
	display: flex;
	flex-wrap: wrap;
}
```

`--node-caret-boundary` — Edge gaps (before the first node, after the last) extend outward beyond the container to enlarge their click target. If the node array has neighboring elements (e.g. a preceding node or surrounding UI), the outward extension can overlap them:

```
Without --node-caret-boundary                  With --node-caret-boundary

: . . . . . . . . . . . . . . . :
: +---------------------------+ :             +-----------------------------+
: | Toolbar / UI              | : ← overlap   | Toolbar / UI                |
: +---------------------------+ :             +-----------------------------+
:                               :
:     edge gap (unbounded)      :   boudary → +-----------------------------+
: . . . . . . . . . . . . . . . :             | : . . . . . . . . . . . . : |
                                              | :   edge gap (clamped)    : |
  +---------------------------+               | : . . . . . . . . . . . . : |
  |  +---------------------+  |               |  +-----------------------+  |
  |  | First node          |  |               |  | First node            |  |
  |  +---------------------+  |               |  +-----------------------+  |
  |    gap between nodes      |               |    gap between nodes        |
  |  +---------------------+  |               |  +-----------------------+  |
  |  | Last node           |  |               |  | Last node             |  |
  |  +---------------------+  |               |  +-----------------------+  |
  +---------------------------+               | : . . . . . . . . . . . . : |
                                              | :   edge gap (clamped)    : |
: . . . . . . . . . . . . . . . :             | : . . . . . . . . . . . . : |
:     edge gap (unbounded)      :   boudary → +-----------------------------+
:                               :
: +---------------------------+ :             +-----------------------------+
: | Footer / UI               | : ← overlap   | Footer / UI                 |
: +---------------------------+ :             +-----------------------------+
: . . . . . . . . . . . . . . . :
```

Set `--node-caret-boundary` to the `anchor-name` of a parent element to clamp edge gaps to that element's edges:

```css
.editor-wrapper {
	anchor-name: --editor-boundary;
	padding: 24px;
}
.editor-wrapper [data-type='node_array'] {
	--node-caret-boundary: --editor-boundary;
}
```

When set, edge gaps clamp to the boundary element's edges instead. When not set, gaps extend to the containing block edge (default).

Since `--node-caret-boundary` inherits to nested node arrays, you may need to unset it on inner containers that should not be clamped:

```css
.inner-container [data-type='node_array'] {
	--node-caret-boundary: initial;
}
```

For per-axis control, use `--node-caret-boundary-x` (left/right) and `--node-caret-boundary-y` (top/bottom). They take precedence over `--node-caret-boundary` when set:

```css
.editor-wrapper [data-type='node_array'] {
	--node-caret-boundary-x: --editor-boundary;
}
```

## Beyond the README

The source code is compact and readable — less than 3000 LOC across a handful of files. We encourage you to explore it. The files in [src/lib](./src/lib) are the library code, while the files in [src/routes](./src/routes) are example code you can copy and adapt to your needs.

## Developing Svedit

Once you've cloned the Svedit repository and installed dependencies with `npm install`, start a development server:

```bash
npm run dev
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Contributing

Contributions are very welcome! Bug reports, bug fixes, and small PRs (a couple of lines of code) don't need any ceremony — just go for it. What follows applies to larger changes and new features.

I take long-term maintainability very seriously. Much like the SQLite project, I prioritize minimalism and code quality over features. This means I may decline pull requests — even good ones — if they don't fit my vision for Svedit at a given point in time. I'll always try to articulate my reasons, but sometimes it comes down to intuition more than logic. Please don't take it personally — it doesn't mean your idea is bad, just that I don't see it belonging in core right now.

### How to contribute a feature

1. **Start with your requirements.** Open an issue describing what you need and why. Wait for a green light that this is something that belongs in core before writing code.
2. **Explore approaches.** For non-trivial features, there may be multiple ways to solve the problem. Discuss trade-offs before committing to one direction — I may ask you to explore alternatives first.
3. **Prove feasibility.** Make a small PR that solves the root of the problem — no optimizations, no UX polish. This lets me evaluate the impact on the library and give you early feedback if your approach conflicts with Svedit's design decisions.
4. **Plan the finish.** Once feasibility is approved, outline the remaining steps and wait for another green light. Then we iterate together until it's ready to merge.

**Please don't work on a feature for a long time without checking in regularly.** I have a much lower tolerance for complexity than most developers, and I need to be able to digest changes in small pieces. Going off and making a large rewrite without involving me will likely be frustrating for both of us.

### Sponsorship

Another great way to help is to donate or sponsor the project, so I can buy more dedicated development time. Email me at michael@letsken.com.

## Beta version

It's still early. Expect bugs. Expect missing features. Expect the need for more work on your part to make this fit for your use case.

## Credits

Svedit is led by [Michael Aufreiter](https://michaelaufreiter.com) with guidance and support from [Johannes Mutter](https://mutter.co).
