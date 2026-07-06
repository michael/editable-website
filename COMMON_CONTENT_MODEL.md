# Common Content Model

The Common Content Model (CCM) describes the portable content schema used by Editable. It aims to cover the common content structures most websites need while staying small enough that site owners can understand and edit it directly.

This document describes the current schema in [`src/lib/document_schema.js`](src/lib/document_schema.js).

## Model vocabulary

Editable documents are graphs of nodes stored by id. Each node has:

- `id`
- `type`
- type-specific properties

The model uses a few naming conventions consistently:

- `content` is reserved for the string payload inside text properties.
- `body` is a node array containing authored nested content.
- `items` is a node array containing repeated structured children.
- `label`, `title`, `description`, and `meta` are text properties with semantic meaning in their node.

### Text properties

Schema type:

```js
{
  type: 'text',
  mark_types: ['strong', 'emphasis'],
  allow_newlines: true
}
```

Document value shape:

```js
{
  content: 'Editable text',
  marks: [],
  annotations: []
}
```

### Node arrays

Schema type:

```js
{
  type: 'node_array',
  node_types: ['paragraph', 'heading_2'],
  mark_types: ['section'],
  default_node_type: 'paragraph'
}
```

Document value shape:

```js
{
  nodes: ['node_id_1', 'node_id_2'],
  marks: [],
  annotations: []
}
```

`mark_types` on a node array enables wrapper marks over child-node ranges. The current shared page body supports `section` marks.

## Node types

[`page`](#node-page) · [`nav`](#node-nav) · [`nav_link`](#node-nav_link) · [`nav_button`](#node-nav_button) · [`nav_image`](#node-nav_image) · [`footer`](#node-footer) · [`footer_link_column`](#node-footer_link_column) · [`footer_link_category`](#node-footer_link_category) · [`footer_link`](#node-footer_link) · [`prose`](#node-prose) · [`prose_grid`](#node-prose_grid) · [`prose_grid_item`](#node-prose_grid_item) · [`paragraph`](#node-paragraph) · [`paragraph_sm`](#node-paragraph_sm) · [`paragraph_lg`](#node-paragraph_lg) · [`paragraph_xl`](#node-paragraph_xl) · [`heading_1`](#node-heading_1) · [`heading_2`](#node-heading_2) · [`heading_3`](#node-heading_3) · [`heading_4`](#node-heading_4) · [`heading_5`](#node-heading_5) · [`list`](#node-list) · [`list_item`](#node-list_item) · [`preformatted`](#node-preformatted) · [`button_group`](#node-button_group) · [`button`](#node-button) · [`image`](#node-image) · [`video`](#node-video) · [`figure`](#node-figure) · [`captioned_figure`](#node-captioned_figure) · [`supporting_media`](#node-supporting_media) · [`gallery`](#node-gallery) · [`gallery_item`](#node-gallery_item) · [`descriptive_gallery`](#node-descriptive_gallery) · [`descriptive_gallery_item`](#node-descriptive_gallery_item) · [`descriptive_listing`](#node-descriptive_listing) · [`descriptive_listing_item`](#node-descriptive_listing_item) · [`accordion`](#node-accordion) · [`accordion_item`](#node-accordion_item) · [`feature`](#node-feature)

## Mark types

[`strong`](#mark-strong) · [`emphasis`](#mark-emphasis) · [`code`](#mark-code) · [`highlight`](#mark-highlight) · [`link`](#mark-link) · [`section`](#mark-section)

## Node: `page`

`page` is the document root. It stores page metadata, shared chrome references, and the ordered page body.

| Property      | Type         | Default  | Allowed node or mark types                                                                                                                                             | Meaning                                                                    |
| ------------- | ------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `title`       | `text`       | none     | no marks                                                                                                                                                               | Page title for metadata and editable previews. Newlines are not allowed.   |
| `description` | `text`       | none     | no marks                                                                                                                                                               | Page description for metadata and editable previews. Newlines are allowed. |
| `image`       | `node`       | `image`  | `image`                                                                                                                                                                | Preview image used for page metadata.                                      |
| `body`        | `node_array` | `prose`  | `prose`, `prose_grid`, `figure`, `captioned_figure`, `gallery`, `feature`, `descriptive_gallery`, `descriptive_listing`, `accordion`, `preformatted`; marks: `section` | Ordered page body blocks.                                                  |
| `nav`         | `node`       | `nav`    | `nav`                                                                                                                                                                  | Shared navigation node.                                                    |
| `footer`      | `node`       | `footer` | `footer`                                                                                                                                                               | Shared footer node.                                                        |

## Node: `nav`

`nav` is the shared site navigation. It has three editable item groups so layouts can distribute logo/image, central links, and right-side actions independently.

| Property       | Type         | Default      | Allowed node types                    | Meaning                                                                 |
| -------------- | ------------ | ------------ | ------------------------------------- | ----------------------------------------------------------------------- |
| `start_items`  | `node_array` | `nav_image`  | `nav_image`, `nav_link`, `nav_button` | Left/start-aligned navigation items. Usually logo or brand image first. |
| `center_items` | `node_array` | `nav_link`   | `nav_link`, `nav_button`, `nav_image` | Center navigation items, usually page links.                            |
| `end_items`    | `node_array` | `nav_button` | `nav_link`, `nav_button`, `nav_image` | Right/end-aligned navigation items, usually calls to action.            |

## Node: `nav_link`

`nav_link` is a plain navigation link.

| Property | Type     | Default | Allowed mark types | Meaning                                   |
| -------- | -------- | ------- | ------------------ | ----------------------------------------- |
| `href`   | `string` | none    | N/A                | Link destination.                         |
| `target` | `string` | `_self` | N/A                | Link target, such as `_self` or `_blank`. |
| `label`  | `text`   | none    | no marks           | Link label. Newlines are not allowed.     |

## Node: `nav_button`

`nav_button` is a navigation link rendered with button styling. It intentionally shares `label`, `href`, and `target` with `nav_link`, so users can type-switch between link and button without losing content.

| Property | Type      | Default | Allowed values or mark types | Meaning                                   |
| -------- | --------- | ------- | ---------------------------- | ----------------------------------------- |
| `layout` | `integer` | `1`     | `1`, `2`                     | Button visual style.                      |
| `href`   | `string`  | none    | N/A                          | Link destination.                         |
| `target` | `string`  | `_self` | N/A                          | Link target, such as `_self` or `_blank`. |
| `label`  | `text`    | none    | no marks                     | Button label. Newlines are not allowed.   |

## Node: `nav_image`

`nav_image` is a linked or unlinked media item for navigation, commonly used for logos.

| Property | Type     | Default | Allowed node types | Meaning                                                         |
| -------- | -------- | ------- | ------------------ | --------------------------------------------------------------- |
| `href`   | `string` | none    | N/A                | Optional link destination. Empty means the image is not linked. |
| `target` | `string` | `_self` | N/A                | Link target, such as `_self` or `_blank`.                       |
| `media`  | `node`   | `image` | `image`, `video`   | Media displayed in the navigation.                              |

## Node: `footer`

`footer` is the shared site footer. Its left/content area is generic rich body content, and its link area is a set of columns.

| Property              | Type         | Default              | Allowed node types                                                                                                                                                       | Meaning                                                                        |
| --------------------- | ------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `body`                | `node_array` | `paragraph`          | `paragraph_sm`, `paragraph`, `paragraph_lg`, `paragraph_xl`, `heading_1`, `heading_2`, `heading_3`, `heading_4`, `heading_5`, `list`, `supporting_media`, `button_group` | Main footer content area. This can contain text, headings, media, and buttons. |
| `footer_link_columns` | `node_array` | `footer_link_column` | `footer_link_column`                                                                                                                                                     | Footer link columns.                                                           |

## Node: `footer_link_column`

`footer_link_column` is one flat column of footer link-related items.

| Property | Type         | Default       | Allowed node types                    | Meaning                                                                             |
| -------- | ------------ | ------------- | ------------------------------------- | ----------------------------------------------------------------------------------- |
| `items`  | `node_array` | `footer_link` | `footer_link_category`, `footer_link` | Ordered category labels and links. Multiple category groups can live in one column. |

## Node: `footer_link_category`

`footer_link_category` labels a group of footer links.

| Property | Type   | Default | Allowed mark types | Meaning                                   |
| -------- | ------ | ------- | ------------------ | ----------------------------------------- |
| `title`  | `text` | none    | no marks           | Category title. Newlines are not allowed. |

## Node: `footer_link`

`footer_link` is a plain footer link.

| Property | Type     | Default | Allowed mark types | Meaning                                   |
| -------- | -------- | ------- | ------------------ | ----------------------------------------- |
| `href`   | `string` | none    | N/A                | Link destination.                         |
| `target` | `string` | `_self` | N/A                | Link target, such as `_self` or `_blank`. |
| `label`  | `text`   | none    | no marks           | Link label. Newlines are not allowed.     |

## Node: `prose`

`prose` is a text-first editorial section. It contains a rich `body` node array.

| Property | Type         | Default     | Allowed node types                                                                                                                                                       | Meaning                                   |
| -------- | ------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| `layout` | `integer`    | `1`         | app-defined layouts 1–6                                                                                                                                                  | Horizontal alignment and width treatment. |
| `body`   | `node_array` | `paragraph` | `paragraph_sm`, `paragraph`, `paragraph_lg`, `paragraph_xl`, `heading_1`, `heading_2`, `heading_3`, `heading_4`, `heading_5`, `list`, `supporting_media`, `button_group` | Ordered prose children.                   |

## Node: `prose_grid`

`prose_grid` is a grid of prose blocks arranged as columns on larger screens.

| Property | Type         | Default           | Allowed node types | Meaning              |
| -------- | ------------ | ----------------- | ------------------ | -------------------- |
| `layout` | `integer`    | `1`               | `1`, `2`           | Grid layout variant. |
| `items`  | `node_array` | `prose_grid_item` | `prose_grid_item`  | Ordered grid items.  |

## Node: `prose_grid_item`

`prose_grid_item` is a prose block used as a child of `prose_grid`.

| Property | Type         | Default     | Allowed node types                                                                                                                                                       | Meaning                 |
| -------- | ------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| `body`   | `node_array` | `paragraph` | `paragraph_sm`, `paragraph`, `paragraph_lg`, `paragraph_xl`, `heading_1`, `heading_2`, `heading_3`, `heading_4`, `heading_5`, `list`, `supporting_media`, `button_group` | Ordered prose children. |

## Node: `paragraph`

`paragraph` is the default rich body copy node.

See [Text node shape](#text-node-shape).

## Node: `paragraph_sm`

`paragraph_sm` is a small supplementary copy node.

See [Text node shape](#text-node-shape).

## Node: `paragraph_lg`

`paragraph_lg` is a larger editorial copy node.

See [Text node shape](#text-node-shape).

## Node: `paragraph_xl`

`paragraph_xl` is a very large editorial copy node.

See [Text node shape](#text-node-shape).

## Node: `heading_1`

`heading_1` is the primary editorial heading node.

See [Text node shape](#text-node-shape).

## Node: `heading_2`

`heading_2` is the secondary editorial heading node.

See [Text node shape](#text-node-shape).

## Node: `heading_3`

`heading_3` is the tertiary editorial heading node.

See [Text node shape](#text-node-shape).

## Node: `heading_4`

`heading_4` is a lower-priority editorial heading node.

See [Text node shape](#text-node-shape).

## Node: `heading_5`

`heading_5` is the least prominent heading node.

See [Text node shape](#text-node-shape).

## Text node shape

The paragraph and heading family share this property shape:

| Property  | Type      | Default | Allowed values or mark types                      | Meaning                                                         |
| --------- | --------- | ------- | ------------------------------------------------- | --------------------------------------------------------------- |
| `layout`  | `integer` | `1`     | `1`, `2`                                          | Layout 1 is the normal style. Layout 2 is muted secondary copy. |
| `content` | `text`    | none    | `strong`, `emphasis`, `code`, `highlight`, `link` | Editable text. Newlines are allowed.                            |

## Node: `list`

`list` is a structured list block for rich content bodies.

| Property     | Type         | Default     | Allowed node types or values | Meaning                             |
| ------------ | ------------ | ----------- | ---------------------------- | ----------------------------------- |
| `layout`     | `integer`    | `1`         | app-defined layouts 1–4      | Marker style for the rendered list. |
| `list_items` | `node_array` | `list_item` | `list_item`                  | Ordered list rows.                  |

## Node: `list_item`

`list_item` is a single list row inside `list`.

| Property  | Type   | Default | Allowed mark types                                | Meaning                                            |
| --------- | ------ | ------- | ------------------------------------------------- | -------------------------------------------------- |
| `content` | `text` | none    | `strong`, `emphasis`, `code`, `highlight`, `link` | Editable list item text. Newlines are not allowed. |

## Node: `preformatted`

`preformatted` is a monospaced text block that preserves spacing and line breaks.

| Property  | Type   | Default | Allowed mark types | Meaning                                       |
| --------- | ------ | ------- | ------------------ | --------------------------------------------- |
| `content` | `text` | none    | no marks           | Preserved text content. Newlines are allowed. |

## Node: `button_group`

`button_group` is a collection of call-to-action buttons.

| Property  | Type         | Default  | Allowed node types | Meaning          |
| --------- | ------------ | -------- | ------------------ | ---------------- |
| `buttons` | `node_array` | `button` | `button`           | Ordered buttons. |

## Node: `button`

`button` is a call-to-action link.

| Property | Type      | Default | Allowed values or mark types | Meaning                                   |
| -------- | --------- | ------- | ---------------------------- | ----------------------------------------- |
| `layout` | `integer` | `1`     | app-defined layouts 1–2      | Visual button style.                      |
| `href`   | `string`  | none    | N/A                          | Link destination.                         |
| `target` | `string`  | `_self` | N/A                          | Link target, such as `_self` or `_blank`. |
| `label`  | `text`    | none    | no marks                     | Button label. Newlines are not allowed.   |

## Node: `image`

`image` stores an image asset and its display controls.

| Property        | Type      | Default   | Meaning                                                            |
| --------------- | --------- | --------- | ------------------------------------------------------------------ |
| `src`           | `string`  | `''`      | Asset id or temporary blob URL before save.                        |
| `mime_type`     | `string`  | `''`      | MIME type, such as `image/webp`, `image/jpeg`, or `image/svg+xml`. |
| `width`         | `integer` | `0`       | Intrinsic image width in pixels.                                   |
| `height`        | `integer` | `0`       | Intrinsic image height in pixels.                                  |
| `alt`           | `string`  | `''`      | Alternative text.                                                  |
| `focal_point_x` | `number`  | `0.5`     | Horizontal focal point as a normalized value.                      |
| `focal_point_y` | `number`  | `0.5`     | Vertical focal point as a normalized value.                        |
| `scale`         | `number`  | `1`       | Display scale applied inside the media frame.                      |
| `object_fit`    | `string`  | `contain` | CSS object-fit behavior.                                           |

## Node: `video`

`video` stores a video asset and uses the same display controls as `image`.

| Property        | Type      | Default   | Meaning                                         |
| --------------- | --------- | --------- | ----------------------------------------------- |
| `src`           | `string`  | `''`      | Asset id or temporary blob URL before save.     |
| `mime_type`     | `string`  | `''`      | MIME type, such as `video/mp4` or `video/webm`. |
| `width`         | `integer` | `0`       | Intrinsic video width in pixels.                |
| `height`        | `integer` | `0`       | Intrinsic video height in pixels.               |
| `alt`           | `string`  | `''`      | Accessible label for the video.                 |
| `focal_point_x` | `number`  | `0.5`     | Horizontal focal point as a normalized value.   |
| `focal_point_y` | `number`  | `0.5`     | Vertical focal point as a normalized value.     |
| `scale`         | `number`  | `1`       | Display scale applied inside the media frame.   |
| `object_fit`    | `string`  | `contain` | CSS object-fit behavior.                        |

## Node: `figure`

`figure` is a standalone media block.

| Property | Type      | Default | Allowed node types or values | Meaning                        |
| -------- | --------- | ------- | ---------------------------- | ------------------------------ |
| `layout` | `integer` | `1`     | app-defined layouts 1–6      | Visual media layout.           |
| `media`  | `node`    | `image` | `image`, `video`             | Media displayed by the figure. |

## Node: `captioned_figure`

`captioned_figure` is a media block with a single caption.

| Property  | Type   | Default | Allowed node or mark types                        | Meaning                                  |
| --------- | ------ | ------- | ------------------------------------------------- | ---------------------------------------- |
| `media`   | `node` | `image` | `image`, `video`                                  | Media displayed by the figure.           |
| `caption` | `text` | none    | `strong`, `emphasis`, `code`, `highlight`, `link` | Short caption. Newlines are not allowed. |

## Node: `supporting_media`

`supporting_media` is media placed inside a rich content flow.

| Property             | Type      | Default | Allowed node types | Meaning                                                                                       |
| -------------------- | --------- | ------- | ------------------ | --------------------------------------------------------------------------------------------- |
| `media_max_width`    | `integer` | `0`     | N/A                | Optional maximum display width. `0` means no explicit maximum.                                |
| `media_aspect_ratio` | `number`  | `0`     | N/A                | Optional display aspect ratio. `0` means use the media's natural ratio or component fallback. |
| `media`              | `node`    | `image` | `image`, `video`   | Media displayed by the supporting media node.                                                 |

## Node: `gallery`

`gallery` is a media-first collection.

| Property        | Type         | Default | Allowed node types or values | Meaning                              |
| --------------- | ------------ | ------- | ---------------------------- | ------------------------------------ |
| `layout`        | `integer`    | `1`     | app-defined layouts 1–5      | Visual arrangement of gallery items. |
| `gallery_items` | `node_array` | none    | `gallery_item`               | Ordered media-first items.           |

## Node: `gallery_item`

`gallery_item` is a media-only item inside `gallery`.

| Property | Type     | Default | Allowed node types | Meaning                                                        |
| -------- | -------- | ------- | ------------------ | -------------------------------------------------------------- |
| `href`   | `string` | none    | N/A                | Optional link destination. Empty means the item is not linked. |
| `target` | `string` | `_self` | N/A                | Link target, such as `_self` or `_blank`.                      |
| `media`  | `node`   | `image` | `image`, `video`   | Media shown by the item.                                       |

## Node: `descriptive_gallery`

`descriptive_gallery` is a gallery whose items each have media, a title, and a description.

| Property | Type         | Default | Allowed node types or values | Meaning                                          |
| -------- | ------------ | ------- | ---------------------------- | ------------------------------------------------ |
| `layout` | `integer`    | `1`     | `1`, `2`                     | Visual arrangement of descriptive gallery items. |
| `items`  | `node_array` | none    | `descriptive_gallery_item`   | Ordered media-title-description items.           |

## Node: `descriptive_gallery_item`

`descriptive_gallery_item` is a media-first item with title and description. It may optionally link somewhere.

| Property      | Type     | Default | Allowed node or mark types | Meaning                                                        |
| ------------- | -------- | ------- | -------------------------- | -------------------------------------------------------------- |
| `href`        | `string` | none    | N/A                        | Optional link destination. Empty means the item is not linked. |
| `target`      | `string` | `_self` | N/A                        | Link target, such as `_self` or `_blank`.                      |
| `media`       | `node`   | `image` | `image`, `video`           | Media shown by the item.                                       |
| `title`       | `text`   | none    | `emphasis`, `highlight`    | Item title. Newlines are not allowed.                          |
| `description` | `text`   | none    | `emphasis`, `highlight`    | Item description. Newlines are allowed.                        |

## Node: `descriptive_listing`

`descriptive_listing` is a collection of text-first items arranged as rows.

| Property | Type         | Default | Allowed node types or values | Meaning                                       |
| -------- | ------------ | ------- | ---------------------------- | --------------------------------------------- |
| `layout` | `integer`    | `1`     | app-defined layouts 1–5      | Visual arrangement of listing items.          |
| `items`  | `node_array` | none    | `descriptive_listing_item`   | Ordered title-description-meta listing items. |

## Node: `descriptive_listing_item`

`descriptive_listing_item` is a text-first row with title, description, and optional meta text. It may optionally link somewhere.

| Property      | Type     | Default | Allowed mark types      | Meaning                                                        |
| ------------- | -------- | ------- | ----------------------- | -------------------------------------------------------------- |
| `href`        | `string` | none    | N/A                     | Optional link destination. Empty means the item is not linked. |
| `target`      | `string` | `_self` | N/A                     | Link target, such as `_self` or `_blank`.                      |
| `title`       | `text`   | none    | `emphasis`, `highlight` | Item title. Newlines are not allowed.                          |
| `description` | `text`   | none    | `emphasis`, `highlight` | Item description. Newlines are allowed.                        |
| `meta`        | `text`   | none    | `emphasis`, `highlight` | Optional metadata. Newlines are not allowed.                   |

## Node: `accordion`

`accordion` is a collapsible collection of accordion items.

| Property | Type         | Default | Allowed node types or values | Meaning                    |
| -------- | ------------ | ------- | ---------------------------- | -------------------------- |
| `layout` | `integer`    | `1`     | app-defined layouts 1–5      | Accordion visual layout.   |
| `items`  | `node_array` | none    | `accordion_item`             | Ordered collapsible items. |

## Node: `accordion_item`

`accordion_item` is a collapsible content block with a title and rich body.

| Property | Type         | Default     | Allowed node or mark types                                                                              | Meaning                               |
| -------- | ------------ | ----------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `title`  | `text`       | none        | `emphasis`, `highlight`                                                                                 | Item title. Newlines are not allowed. |
| `body`   | `node_array` | `paragraph` | `paragraph_sm`, `paragraph`, `paragraph_lg`, `paragraph_xl`, `list`, `supporting_media`, `button_group` | Expandable rich body content.         |

## Node: `feature`

`feature` is a flexible feature section with media and a rich body.

| Property | Type         | Default     | Allowed node types or values                                                                                                                                             | Meaning                    |
| -------- | ------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| `layout` | `integer`    | `1`         | app-defined layouts 1–2                                                                                                                                                  | Feature layout variant.    |
| `media`  | `node`       | `image`     | `image`, `video`                                                                                                                                                         | Feature media.             |
| `body`   | `node_array` | `paragraph` | `paragraph_sm`, `paragraph`, `paragraph_lg`, `paragraph_xl`, `heading_1`, `heading_2`, `heading_3`, `heading_4`, `heading_5`, `list`, `supporting_media`, `button_group` | Feature text/content body. |

## Mark: `strong`

`strong` marks a text range as strongly emphasized.

## Mark: `emphasis`

`emphasis` marks a text range as emphasized.

## Mark: `code`

`code` marks a text range as inline code.

## Mark: `highlight`

`highlight` marks a text range as highlighted.

## Mark: `link`

`link` marks a text range as a hyperlink.

| Property | Type     | Default | Meaning                                                            |
| -------- | -------- | ------- | ------------------------------------------------------------------ |
| `href`   | `string` | none    | Link destination. Internal page links use root-relative page URLs. |
| `target` | `string` | `_self` | Link target, such as `_self` or `_blank`.                          |

## Mark: `section`

`section` marks a range in a node array, currently used for page body section grouping.
