# Common Content Model

The Common Content Model (CCM) describes the portable content schema used by Editable Website. It aims to cover 80%+ of the content structures most websites need.

This write-up is AI-assisted and currently a work in progress. Its purpose is to support discussion about the content model with Editable Website users.

A document is a graph of nodes stored by id. Each node has an `id`, a `type`, and type-specific properties. The CCM uses Svedit schema primitives such as `string`, `integer`, `number`, `annotated_text`, `node`, and `node_array`; see the [Svedit schema documentation](https://github.com/michael/svedit#schema) for the underlying data type definitions.

**Node types**

[`text`](#node-text) · [`list`](#node-list) · [`list_item`](#node-list_item) · [`image`](#node-image) · [`video`](#node-video) · [`button`](#node-button) · [`supporting_media`](#node-supporting_media) · [`page`](#node-page) · [`hero`](#node-hero) · [`prose`](#node-prose) · [`gallery`](#node-gallery) · [`gallery_item`](#node-gallery_item) · [`titled_gallery`](#node-titled_gallery) · [`titled_gallery_item`](#node-titled_gallery_item) · [`descriptive_gallery`](#node-descriptive_gallery) · [`descriptive_gallery_item`](#node-descriptive_gallery_item)

**Annotation types**

[`strong`](#annotation-strong) · [`emphasis`](#annotation-emphasis) · [`highlight`](#annotation-highlight) · [`link`](#annotation-link)

## Node: `text`

`text` is a block of annotated textual content inside `prose`.

| Property  | Type             | Default | Allowed annotation types                  | Meaning                                   |
| --------- | ---------------- | ------- | ----------------------------------------- | ----------------------------------------- |
| `layout`  | `integer`        | `1`     | `1`, `2`, `3`, `4`, `5`                   | Text role and rendered element.           |
| `content` | `annotated_text` | None    | `strong`, `emphasis`, `highlight`, `link` | Editable rich text. Newlines are allowed. |

### Text layouts

| Value | Rendered role | Meaning                                                        |
| ----- | ------------- | -------------------------------------------------------------- |
| `1`   | Paragraph     | Normal body copy.                                              |
| `2`   | Heading 1     | Primary heading.                                               |
| `3`   | Heading 2     | Secondary heading.                                             |
| `4`   | Heading 3     | Tertiary heading.                                              |
| `5`   | Eyebrow       | Small uppercase label rendered before nearby headings or copy. |

## Node: `list_item`

`list_item` is a single list row inside `list`.

| Property  | Type             | Default | Allowed annotation types                  | Meaning                                            |
| --------- | ---------------- | ------- | ----------------------------------------- | -------------------------------------------------- |
| `content` | `annotated_text` | None    | `strong`, `emphasis`, `highlight`, `link` | Editable list item text. Newlines are not allowed. |

## Node: `list`

`list` is a structured list block for editorial flows such as `prose` or accordion bodies.

| Property     | Type         | Default     | Allowed node types | Meaning                               |
| ------------ | ------------ | ----------- | ------------------ | ------------------------------------- |
| `layout`     | `integer`    | `1`         | `1`, `2`, `3`, `4` | Marker style for the rendered list.   |
| `list_items` | `node_array` | `list_item` | `list_item`        | Ordered list items owned by the list. |

### List layouts

| Value | Meaning                  |
| ----- | ------------------------ |
| `1`   | Dash markers.            |
| `2`   | Checkmark markers.       |
| `3`   | Zero-padded numbering.   |
| `4`   | Lowercase latin letters. |

## Node: `image`

`image` stores an image asset and its display controls.

| Property        | Type      | Default | Meaning                                                             |
| --------------- | --------- | ------- | ------------------------------------------------------------------- |
| `src`           | `string`  | None    | Asset id or temporary blob URL before save.                         |
| `mime_type`     | `string`  | None    | MIME type, such as `image/webp`, `image/jpeg`, or `image/svg+xml`.  |
| `width`         | `integer` | None    | Intrinsic image width in pixels.                                    |
| `height`        | `integer` | None    | Intrinsic image height in pixels.                                   |
| `alt`           | `string`  | None    | Alternative text.                                                   |
| `focal_point_x` | `number`  | `0`     | Horizontal focal point as a normalized value, typically `0` to `1`. |
| `focal_point_y` | `number`  | `0`     | Vertical focal point as a normalized value, typically `0` to `1`.   |
| `scale`         | `number`  | `1.0`   | Display scale applied inside the media frame.                       |
| `object_fit`    | `string`  | `cover` | CSS object-fit behavior, such as `cover` or `contain`.              |

## Node: `video`

`video` stores a video asset and uses the same display controls as `image`.

| Property        | Type      | Default | Meaning                                                             |
| --------------- | --------- | ------- | ------------------------------------------------------------------- |
| `src`           | `string`  | None    | Asset id or temporary blob URL before save.                         |
| `mime_type`     | `string`  | None    | MIME type, such as `video/mp4` or `video/webm`.                     |
| `width`         | `integer` | None    | Intrinsic video width in pixels.                                    |
| `height`        | `integer` | None    | Intrinsic video height in pixels.                                   |
| `alt`           | `string`  | None    | Accessible label for the video.                                     |
| `focal_point_x` | `number`  | `0`     | Horizontal focal point as a normalized value, typically `0` to `1`. |
| `focal_point_y` | `number`  | `0`     | Vertical focal point as a normalized value, typically `0` to `1`.   |
| `scale`         | `number`  | `1.0`   | Display scale applied inside the media frame.                       |
| `object_fit`    | `string`  | `cover` | CSS object-fit behavior, such as `cover` or `contain`.              |

## Node: `page`

`page` is the document root. It stores page metadata, shared chrome references, and an ordered body of content blocks.

| Property      | Type             | Default  | Allowed node types                                                  | Meaning                                                                                                                               |
| ------------- | ---------------- | -------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `title`       | `annotated_text` | None     | No annotations                                                      | Page title used for head metadata and editable search-result preview. Newlines are not allowed.                                       |
| `description` | `annotated_text` | None     | No annotations                                                      | Page description used for head metadata and editable search-result preview. Newlines are allowed.                                     |
| `image`       | `node`           | `image`  | `image`                                                             | Preview image used for page metadata. The `image` node is documented below because it is also used by `prose` via `supporting_media`. |
| `body`        | `node_array`     | `prose`  | `hero`, `media_hero`, `prose`, `gallery`, `titled_gallery`, `descriptive_gallery` | Ordered page body blocks. The current app supports additional body block types, but they are outside this initial CCM scope.          |
| `nav`         | `node`           | `nav`    | Out of scope                                                        | Shared navigation reference. Not specified in this draft.                                                                             |
| `footer`      | `node`           | `footer` | Out of scope                                                        | Shared footer reference. Not specified in this draft.                                                                                 |

## Node: `hero`

`hero` is a high-emphasis introductory section. It is intentionally more structured than `prose` so layouts can preserve a clear visual hierarchy: one title, one supporting description, and one action area.

| Property      | Type             | Default  | Allowed node or annotation types          | Meaning                                                                                     |
| ------------- | ---------------- | -------- | ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| `layout`      | `integer`        | `1`      | Theme-defined                             | Visual arrangement of the hero content.                                                     |
| `title`       | `annotated_text` | None     | `strong`, `emphasis`, `highlight`, `link` | Required primary hero statement. Newlines are not allowed.                                  |
| `description` | `annotated_text` | None     | `strong`, `emphasis`, `highlight`, `link` | Supporting hero copy. Kept as a single text property so layouts can reason about hierarchy. |
| `buttons`     | `node_array`     | `button` | `button`                                  | Optional action group. An empty array means the hero has no buttons.                        |

## Node: `media_hero`

`media_hero` is a high-emphasis introductory section with a large media region integrated into the layout. In the default layout, the title, description, and optional buttons appear first, followed by a large image or video that fills the remaining space so the full composition reaches the height of the viewport.

| Property      | Type             | Default  | Allowed node or annotation types          | Meaning                                                                                          |
| ------------- | ---------------- | -------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `layout`      | `integer`        | `1`      | Theme-defined                             | Visual arrangement of the media hero content.                                                    |
| `title`       | `annotated_text` | None     | `strong`, `emphasis`, `highlight`, `link` | Required primary media hero statement. Newlines are not allowed.                                 |
| `description` | `annotated_text` | None     | `strong`, `emphasis`, `highlight`, `link` | Supporting media hero copy. Kept as a single text property so layouts can reason about hierarchy. |
| `buttons`     | `node_array`     | `button` | `button`                                  | Optional action group. An empty array means the media hero has no buttons.                       |
| `media`       | `node`           | `image`  | `image`, `video`                          | Large hero media region that completes the viewport-height composition.                          |

## Node: `button`

`button` is a call-to-action link, usually rendered inside a hero or other action group.

| Property | Type             | Default | Allowed annotation types | Meaning                                   |
| -------- | ---------------- | ------- | ------------------------ | ----------------------------------------- |
| `layout` | `integer`        | `1`     | Theme-defined            | Visual button style.                      |
| `label`  | `annotated_text` | None    | No annotations           | Button label. Newlines are not allowed.   |
| `href`   | `string`         | None    | N/A                      | Link destination.                         |
| `target` | `string`         | `_self` | N/A                      | Link target, such as `_self` or `_blank`. |

## Node: `prose`

`prose` is a text-first editorial section. It primarily contains headings and paragraphs, and may include supporting media that illustrates or visually enriches nearby text.

| Property  | Type         | Default | Allowed node types         | Meaning                                   |
| --------- | ------------ | ------- | -------------------------- | ----------------------------------------- |
| `layout`  | `integer`    | `1`     | `1`, `2`, `3`              | Horizontal alignment and width treatment. |
| `content` | `node_array` | `text`  | `text`, `list`, `supporting_media` | Ordered prose children.                   |

### Prose layouts

| Value | Meaning              |
| ----- | -------------------- |
| `1`   | Left-aligned prose.  |
| `2`   | Centered prose.      |
| `3`   | Right-aligned prose. |

## Node: `supporting_media`

`supporting_media` is media placed inside a `prose` flow to support, illustrate, or visually enrich nearby text. It references either an `image` or `video` node and can be sized independently from text.



| Property             | Type      | Default | Allowed node types | Meaning                                                                                       |
| -------------------- | --------- | ------- | ------------------ | --------------------------------------------------------------------------------------------- |
| `media_max_width`    | `integer` | `0`     | N/A                | Optional maximum display width for the media. `0` means no explicit maximum.                  |
| `media_aspect_ratio` | `number`  | `0`     | N/A                | Optional display aspect ratio. `0` means use the media's natural ratio or component fallback. |
| `media`              | `node`    | `image` | `image`, `video`   | Media displayed by the supporting media node.                                                 |

## Node: `accordion`

`accordion` is a collapsible collection of accordion items.

| Property | Type         | Default          | Allowed node types | Meaning                          |
| -------- | ------------ | ---------------- | ------------------ | -------------------------------- |
| `items`  | `node_array` | `accordion_item` | `accordion_item`   | Ordered collapsible child items. |

## Node: `accordion_item`

`accordion_item` is a collapsible content block with a single title and a rich body. The title acts as the heading of the collapsible. The body accepts the same child nodes as `prose`, allowing a couple of paragraphs and optional supporting media inside the expanded content.

| Property | Type             | Default | Allowed node or annotation types | Meaning                                                              |
| -------- | ---------------- | ------- | -------------------------------- | -------------------------------------------------------------------- |
| `title`  | `annotated_text` | None    | `emphasis`, `highlight`, `link`  | Required heading of the collapsible. Newlines are not allowed.       |
| `body`   | `node_array`     | `text`  | `text`, `list`, `supporting_media` | Expandable rich body content, using the same child nodes as `prose`. |

## Node: `gallery`

A gallery is a collection of media-first items. Layouts may render those items as grids, mosaics, carousels, or lists.

`gallery` is used when each item only needs media. Items may optionally link somewhere, but linking is behavior, not the defining content structure. If every item also needs a title, use `titled_gallery` instead.

| Property | Type         | Default        | Allowed node types | Meaning                                  |
| -------- | ------------ | -------------- | ------------------ | ---------------------------------------- |
| `layout` | `integer`    | `1`            | Theme-defined      | Visual arrangement of the gallery items. |
| `items`  | `node_array` | `gallery_item` | `gallery_item`     | Ordered media-first items.               |

## Node: `gallery_item`

`gallery_item` is a media-only item inside `gallery`.

| Property | Type     | Default | Allowed node types | Meaning                                                        |
| -------- | -------- | ------- | ------------------ | -------------------------------------------------------------- |
| `media`  | `node`   | `image` | `image`, `video`   | Media shown by the item.                                       |
| `href`   | `string` | None    | N/A                | Optional link destination. Empty means the item is not linked. |
| `target` | `string` | `_self` | N/A                | Link target, such as `_self` or `_blank`.                      |

## Node: `titled_gallery`

`titled_gallery` is a gallery whose items each have media and a title. Items may optionally link somewhere, but linking is behavior, not the defining content structure.

| Property | Type         | Default               | Allowed node types    | Meaning                                         |
| -------- | ------------ | --------------------- | --------------------- | ----------------------------------------------- |
| `layout` | `integer`    | `1`                   | Theme-defined         | Visual arrangement of the titled gallery items. |
| `items`  | `node_array` | `titled_gallery_item` | `titled_gallery_item` | Ordered media-and-title items.                  |

## Node: `titled_gallery_item`

`titled_gallery_item` is a media-first item with a required title. It may be rendered as a card, tile, carousel slide, or list row depending on the parent gallery layout.

| Property | Type             | Default | Allowed node or annotation types | Meaning                                                        |
| -------- | ---------------- | ------- | -------------------------------- | -------------------------------------------------------------- |
| `media`  | `node`           | `image` | `image`, `video`                 | Media shown by the item.                                       |
| `title`  | `annotated_text` | None    | `emphasis`, `highlight`          | Required item title. Newlines are not allowed.                 |
| `href`   | `string`         | None    | N/A                              | Optional link destination. Empty means the item is not linked. |
| `target` | `string`         | `_self` | N/A                              | Link target, such as `_self` or `_blank`.                      |

## Node: `descriptive_gallery`

`descriptive_gallery` is a gallery whose items each have media, a title, and a description. Items may optionally link somewhere, but linking is behavior, not the defining content structure.

| Property | Type         | Default                    | Allowed node types         | Meaning                                              |
| -------- | ------------ | -------------------------- | -------------------------- | ---------------------------------------------------- |
| `layout` | `integer`    | `1`                        | Theme-defined              | Visual arrangement of the descriptive gallery items. |
| `items`  | `node_array` | `descriptive_gallery_item` | `descriptive_gallery_item` | Ordered media-title-description items.               |

## Node: `descriptive_gallery_item`

`descriptive_gallery_item` is a media-first item with a required title and description. It may be rendered as a card, tile, carousel slide, or list row depending on the parent gallery layout.

Editable Website does not define chronological post types in the core model. Article, project, product, or resource listings can be modeled with galleries. If structured metadata is not needed, compact metadata can be included in the title or description. Apps that need structured fields such as date, category, author, or reading time should extend the model.

| Property      | Type             | Default | Allowed node or annotation types | Meaning                                                        |
| ------------- | ---------------- | ------- | -------------------------------- | -------------------------------------------------------------- |
| `media`       | `node`           | `image` | `image`, `video`                 | Media shown by the item.                                       |
| `title`       | `annotated_text` | None    | `emphasis`, `highlight`          | Required item title. Newlines are not allowed.                 |
| `description` | `annotated_text` | None    | `emphasis`, `highlight`, `link`  | Required item description. Newlines are allowed.               |
| `href`        | `string`         | None    | N/A                              | Optional link destination. Empty means the item is not linked. |
| `target`      | `string`         | `_self` | N/A                              | Link target, such as `_self` or `_blank`.                      |

## Node: `listing`

`listing` is a collection of text-first items arranged as rows. A classic listing item has a title on the left and an optional meta field on the right. Items may optionally link somewhere, but linking is behavior, not the defining content structure.

| Property | Type         | Default        | Allowed node types | Meaning                                  |
| -------- | ------------ | -------------- | ------------------ | ---------------------------------------- |
| `layout` | `integer`    | `1`            | Theme-defined      | Visual arrangement of the listing items. |
| `items`  | `node_array` | `listing_item` | `listing_item`     | Ordered title-and-meta listing items.    |

## Node: `listing_item`

`listing_item` is a text-first row with a required title and an optional meta field. It is intended for classic lists where the title sits on the left and meta information, if present, sits on the right.

| Property | Type             | Default | Allowed node or annotation types | Meaning                                                                            |
| -------- | ---------------- | ------- | -------------------------------- | ---------------------------------------------------------------------------------- |
| `title`  | `annotated_text` | None    | `emphasis`, `highlight`, `link`  | Required item title. Newlines are not allowed.                                     |
| `meta`   | `annotated_text` | None    | `emphasis`, `highlight`          | Optional item metadata, typically rendered on the right. Newlines are not allowed. |
| `href`   | `string`         | None    | N/A                              | Optional link destination. Empty means the item is not linked.                     |
| `target` | `string`         | `_self` | N/A                              | Link target, such as `_self` or `_blank`.                                          |

## Node: `descriptive_listing`

`descriptive_listing` is a collection of text-first items arranged as rows. Each item has a title and description, plus an optional meta field. Items may optionally link somewhere, but linking is behavior, not the defining content structure.

| Property | Type         | Default                    | Allowed node types         | Meaning                                              |
| -------- | ------------ | -------------------------- | -------------------------- | ---------------------------------------------------- |
| `layout` | `integer`    | `1`                        | Theme-defined              | Visual arrangement of the descriptive listing items. |
| `items`  | `node_array` | `descriptive_listing_item` | `descriptive_listing_item` | Ordered title-description-meta listing items.        |

## Node: `descriptive_listing_item`

`descriptive_listing_item` is a text-first row with a required title and description, plus an optional meta field. It is intended for list layouts where the title and description are grouped on the left and the meta field, if present, sits on the right.

| Property      | Type             | Default | Allowed node or annotation types | Meaning                                                                            |
| ------------- | ---------------- | ------- | -------------------------------- | ---------------------------------------------------------------------------------- |
| `title`       | `annotated_text` | None    | `emphasis`, `highlight`, `link`  | Required item title. Newlines are not allowed.                                     |
| `description` | `annotated_text` | None    | `emphasis`, `highlight`, `link`  | Required item description. Newlines are allowed.                                   |
| `meta`        | `annotated_text` | None    | `emphasis`, `highlight`          | Optional item metadata, typically rendered on the right. Newlines are not allowed. |
| `href`        | `string`         | None    | N/A                              | Optional link destination. Empty means the item is not linked.                     |
| `target`      | `string`         | `_self` | N/A                              | Link target, such as `_self` or `_blank`.                                          |

## Annotation: `strong`

`strong` marks an annotated text range as strongly emphasized.

## Annotation: `emphasis`

`emphasis` marks an annotated text range as emphasized.

## Annotation: `highlight`

`highlight` marks an annotated text range as highlighted.

## Annotation: `link`

`link` marks an annotated text range as a hyperlink.

| Property | Type     | Default | Meaning                                                            |
| -------- | -------- | ------- | ------------------------------------------------------------------ |
| `href`   | `string` | None    | Link destination. Internal page links use root-relative page URLs. |
| `target` | `string` | `_self` | Link target, such as `_self` or `_blank`.                          |
