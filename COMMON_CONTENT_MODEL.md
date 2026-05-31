# Common content model

The Common Content Model (CCM) describes the portable content schema used by Editable Website. It aims to cover 80%+ of the content structures most websites need.

## Core conventions

A document is a graph of nodes stored by id. Each node has at least:

| Field  | Type     | Meaning                                              |
| ------ | -------- | ---------------------------------------------------- |
| `id`   | `string` | Stable node id used for references from other nodes. |
| `type` | `string` | Node type name, such as `page`, `prose`, or `text`.  |

Node references are stored as ids. A `node` property stores one node id, while a `node_array` property stores an ordered array of node ids.

## Property types

| Type             | JSON shape              | Meaning                               |
| ---------------- | ----------------------- | ------------------------------------- |
| `string`         | `string`                | Plain string value.                   |
| `integer`        | `number`                | Whole-number value.                   |
| `number`         | `number`                | Numeric value, including decimals.    |
| `annotated_text` | `{ text, annotations }` | Text plus optional range annotations. |
| `node`           | `string`                | Reference to a single node id.        |
| `node_array`     | `string[]`              | Ordered references to child node ids. |

## Annotated text

Annotated text is represented as:

```json
{
	"text": "Text with emphasis",
	"annotations": [
		{
			"start_offset": 10,
			"end_offset": 18,
			"node_id": "annotation_1"
		}
	]
}
```

| Field          | Type      | Meaning                                                                        |
| -------------- | --------- | ------------------------------------------------------------------------------ |
| `text`         | `string`  | The editable text content.                                                     |
| `annotations`  | `array`   | Ranges that reference annotation nodes.                                        |
| `start_offset` | `integer` | Start character offset, inclusive.                                             |
| `end_offset`   | `integer` | End character offset, exclusive.                                               |
| `node_id`      | `string`  | Id of an annotation node such as `strong`, `emphasis`, `highlight`, or `link`. |

Each annotated text property defines whether newlines are allowed and which annotation node types may be used.

## Node: `page`

`page` is the document root. It stores page metadata, shared chrome references, and an ordered body of content blocks.

| Property      | Type             | Default  | Allowed node types                   | Meaning                                                                                                                         |
| ------------- | ---------------- | -------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `title`       | `annotated_text` | None     | No annotations                       | Page title used for head metadata and editable search-result preview. Newlines are not allowed.                                 |
| `description` | `annotated_text` | None     | No annotations                       | Page description used for head metadata and editable search-result preview. Newlines are allowed.                               |
| `image`       | `node`           | `image`  | `image`                              | Preview image used for page metadata. The `image` node is documented below because it is also used by `prose` via `decoration`. |
| `body`        | `node_array`     | `prose`  | `prose`, `gallery`, `titled_gallery` | Ordered page body blocks. The current app supports additional body block types, but they are outside this initial CCM scope.    |
| `nav`         | `node`           | `nav`    | Out of scope                         | Shared navigation reference. Not specified in this draft.                                                                       |
| `footer`      | `node`           | `footer` | Out of scope                         | Shared footer reference. Not specified in this draft.                                                                           |

## Node: `prose`

`prose` is a section of editorial content. It contains an ordered flow of text and optional decorative media.

| Property  | Type         | Default | Allowed node types   | Meaning                                   |
| --------- | ------------ | ------- | -------------------- | ----------------------------------------- |
| `layout`  | `integer`    | `1`     | `1`, `2`, `3`        | Horizontal alignment and width treatment. |
| `content` | `node_array` | `text`  | `text`, `decoration` | Ordered prose children.                   |

### Prose layouts

| Value | Meaning              |
| ----- | -------------------- |
| `1`   | Left-aligned prose.  |
| `2`   | Centered prose.      |
| `3`   | Right-aligned prose. |

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

## Node: `decoration`

`decoration` is a decorative media block inside `prose`. It references either an `image` or `video` node and can be sized independently from text.

| Property             | Type      | Default | Allowed node types | Meaning                                                                                       |
| -------------------- | --------- | ------- | ------------------ | --------------------------------------------------------------------------------------------- |
| `media_max_width`    | `integer` | `0`     | N/A                | Optional maximum display width for the media. `0` means no explicit maximum.                  |
| `media_aspect_ratio` | `number`  | `0`     | N/A                | Optional display aspect ratio. `0` means use the media's natural ratio or component fallback. |
| `media`              | `node`    | `image` | `image`, `video`   | Media displayed by the decoration.                                                            |

## Node: `gallery`

A gallery is a collection of media-first items. Layouts may render those items as grids, mosaics, carousels, or lists.

`gallery` is used when each item only needs media. If every item also needs a title, use `titled_gallery` instead.

| Property | Type         | Default        | Allowed node types | Meaning                                  |
| -------- | ------------ | -------------- | ------------------ | ---------------------------------------- |
| `layout` | `integer`    | `1`            | Theme-defined      | Visual arrangement of the gallery items. |
| `items`  | `node_array` | `gallery_item` | `gallery_item`     | Ordered media-first items.               |

## Node: `gallery_item`

`gallery_item` is a media-only item inside `gallery`.

| Property | Type   | Default | Allowed node types | Meaning                  |
| -------- | ------ | ------- | ------------------ | ------------------------ |
| `media`  | `node` | `image` | `image`, `video`   | Media shown by the item. |

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
