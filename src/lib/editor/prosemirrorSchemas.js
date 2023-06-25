import { Schema } from 'prosemirror-model';

const pDOM = ['p', 0];
const blockquoteDOM = ['blockquote', 0];
const brDOM = ['br'];
const olDOM = ['ol', 0];
const ulDOM = ['ul', 0];
const liDOM = ['li', 0];
const emDOM = ['em', 0];
const strongDOM = ['strong', 0];

// :: Object
// [Specs](#model.NodeSpec) for the nodes defined in this schema.

// :: Object [Specs](#model.MarkSpec) for the marks in the schema.
export const marks = {
  // :: MarkSpec A link. Has `href` and `title` attributes. `title`
  // defaults to the empty string. Rendered and parsed as an `<a>`
  // element.
  link: {
    attrs: {
      href: {},
      title: { default: null }
    },
    inclusive: false,
    parseDOM: [
      {
        tag: 'a[href]',
        getAttrs(dom) {
          return { href: dom.getAttribute('href'), title: dom.getAttribute('title') };
        }
      }
    ],
    toDOM(node) {
      const { href, title } = node.attrs;
      return ['a', { href, title }, 0];
    }
  },

  // :: MarkSpec An emphasis mark. Rendered as an `<em>` element.
  // Has parse rules that also match `<i>` and `font-style: italic`.
  em: {
    parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
    toDOM() {
      return emDOM;
    }
  },

  // :: MarkSpec A strong mark. Rendered as `<strong>`, parse rules
  // also match `<b>` and `font-weight: bold`.
  strong: {
    parseDOM: [
      { tag: 'strong' },
      // This works around a Google Docs misbehavior where
      // pasted content will be inexplicably wrapped in `<b>`
      // tags with a font-weight normal.
      { tag: 'b', getAttrs: node => node.style.fontWeight !== 'normal' && null },
      { style: 'font-weight', getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null }
    ],
    toDOM() {
      return strongDOM;
    }
  }
};

/**
 * Schema to represent a single line of plain text
 * @type {Schema}
 */
export const singleLinePlainTextSchema = new Schema({
  nodes: {
    doc: { content: 'text*' },
    text: { inline: true }
  }
});

/**
 * Schema to represent a single line of plain text
 * @type {Schema}
 */
export const singleLineRichTextSchema = new Schema({
  nodes: {
    doc: { content: 'text*' },
    text: { inline: true }
  },
  marks
});

/**
 * Schema to represent rich text
 * @type {Schema}
 */
export const multiLineRichTextSchema = new Schema({
  nodes: {
    // :: NodeSpec The top level document node.
    doc: {
      content: 'block+'
    },

    // :: NodeSpec A plain paragraph textblock. Represented in the DOM
    // as a `<p>` element.
    paragraph: {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM() {
        return pDOM;
      }
    },

    // :: NodeSpec
    // An ordered list [node spec](#model.NodeSpec). Has a single
    // attribute, `order`, which determines the number at which the list
    // starts counting, and defaults to 1. Represented as an `<ol>`
    // element.
    ordered_list: {
      content: 'list_item+',
      group: 'block',
      attrs: { order: { default: 1 } },
      parseDOM: [
        {
          tag: 'ol',
          getAttrs(dom) {
            return { order: dom.hasAttribute('start') ? +dom.getAttribute('start') : 1 };
          }
        }
      ],
      toDOM(node) {
        return node.attrs.order === 1 ? olDOM : ['ol', { start: node.attrs.order }, 0];
      }
    },

    // :: NodeSpec
    // A bullet list node spec, represented in the DOM as `<ul>`.
    bullet_list: {
      content: 'list_item+',
      group: 'block',
      parseDOM: [{ tag: 'ul' }],
      toDOM() {
        return ulDOM;
      }
    },

    // :: NodeSpec
    // A list item (`<li>`) spec.
    list_item: {
      content: 'paragraph+', // only allow one or more paragraphs
      // content: 'paragraph (orderedList | bulletList | paragraph)*',
      parseDOM: [{ tag: 'li' }],
      toDOM() {
        return liDOM;
      },
      defining: true
    },

    // :: NodeSpec A blockquote (`<blockquote>`) wrapping one or more blocks.
    blockquote: {
      content: 'paragraph+',
      group: 'block',
      defining: true,
      parseDOM: [{ tag: 'blockquote' }],
      toDOM() {
        return blockquoteDOM;
      }
    },

    // :: NodeSpec A heading textblock, with a `level` attribute that
    // should hold the number 1 to 6. Parsed and serialized as `<h1>` to
    // `<h6>` elements.
    heading: {
      attrs: { level: { default: 1 } },
      content: 'inline*',
      marks: '',
      group: 'block',
      defining: true,
      parseDOM: [
        {
          tag: 'h2',
          getAttrs() {
            return { level: 1 };
          }
        },
        {
          tag: 'h3',
          getAttrs() {
            return { level: 2 };
          }
        },
        {
          tag: 'h4',
          getAttrs() {
            return { level: 3 };
          }
        }
      ],
      toDOM(node) {
        return ['h' + (parseInt(node.attrs.level) + 1), {}, 0];
      }
    },

    // :: NodeSpec The text node.
    text: {
      group: 'inline'
    },

    // :: NodeSpec An inline image (`<img>`) node. Supports `src`,
    // `alt`, and `href` attributes. The latter two default to the empty
    // string.
    image: {
      // inline: true,
      attrs: {
        src: {},
        width: {},
        height: {}
      },
      group: 'block',
      draggable: true,
      parseDOM: [
        {
          tag: 'img',
          getAttrs(dom) {
            return {
              src: dom.getAttribute('src'),
              width: dom.getAttribute('width'),
              height: dom.getAttribute('height')
            };
          }
        }
      ],
      toDOM(node) {
        const { src, width, height } = node.attrs;
        return [
          'img',
          {
            src: src,
            width: width,
            height: height
          }
        ];
      }
    },

    // :: NodeSpec A hard line break, represented in the DOM as `<br>`.
    hard_break: {
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{ tag: 'br' }],
      toDOM() {
        return brDOM;
      }
    }
  },
  marks
});

/**
 * Schema to represent rich text
 * @type {Schema}
 */
export const multiLinePlainTextSchema = new Schema({
  nodes: {
    // :: NodeSpec The top level document node.
    doc: {
      content: 'block+'
    },

    // :: NodeSpec A plain paragraph textblock. Represented in the DOM
    // as a `<p>` element.
    paragraph: {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM() {
        return pDOM;
      }
    },

    // :: NodeSpec The text node.
    text: {
      group: 'inline'
    },

    // :: NodeSpec A hard line break, represented in the DOM as `<br>`.
    hard_break: {
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{ tag: 'br' }],
      toDOM() {
        return brDOM;
      }
    }
  }
});
