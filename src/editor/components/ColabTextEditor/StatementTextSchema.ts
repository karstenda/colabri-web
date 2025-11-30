import { Schema } from 'prosemirror-model';

// Simplified schema with only basic formatting features
export const statementTextSchema = new Schema({
  nodes: {
    doc: {
      content: 'block+',
    },
    paragraph: {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM() {
        return ['p', 0];
      },
    },
    bullet_list: {
      content: 'list_item+',
      group: 'block',
      parseDOM: [{ tag: 'ul' }],
      toDOM() {
        return ['ul', 0];
      },
    },
    ordered_list: {
      content: 'list_item+',
      group: 'block',
      attrs: { order: { default: 1 } },
      parseDOM: [
        {
          tag: 'ol',
          getAttrs(dom) {
            return {
              order: (dom as HTMLElement).hasAttribute('start')
                ? +(dom as HTMLElement).getAttribute('start')!
                : 1,
            };
          },
        },
      ],
      toDOM(node) {
        return node.attrs.order === 1
          ? ['ol', 0]
          : ['ol', { start: node.attrs.order }, 0];
      },
    },
    list_item: {
      content: 'paragraph block*',
      parseDOM: [{ tag: 'li' }],
      toDOM() {
        return ['li', 0];
      },
      defining: true,
    },
    text: {
      group: 'inline',
    },
  },
  marks: {
    strong: {
      excludes: 'strong',
      parseDOM: [
        { tag: 'strong' },
        {
          tag: 'b',
          getAttrs: (node) =>
            (node as HTMLElement).style.fontWeight !== 'normal' && null,
        },
        {
          style: 'font-weight=400',
          clearMark: (m) => m.type.name === 'strong',
        },
        {
          style: 'font-weight',
          getAttrs: (value) =>
            /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
        },
      ],
      toDOM() {
        return ['strong', 0];
      },
    },
    em: {
      parseDOM: [
        { tag: 'i' },
        { tag: 'em' },
        { style: 'font-style=italic' },
        { style: 'font-style=normal', clearMark: (m) => m.type.name === 'em' },
      ],
      toDOM() {
        return ['em', 0];
      },
    },
    underline: {
      parseDOM: [
        { tag: 'u' },
        { style: 'text-decoration=underline' },
        { style: 'text-decoration-line=underline' },
      ],
      toDOM() {
        return ['u', 0];
      },
    },
    superscript: {
      excludes: 'subscript',
      parseDOM: [{ tag: 'sup' }, { style: 'vertical-align=super' }],
      toDOM() {
        return ['sup', 0];
      },
    },
    subscript: {
      excludes: 'superscript',
      parseDOM: [{ tag: 'sub' }, { style: 'vertical-align=sub' }],
      toDOM() {
        return ['sub', 0];
      },
    },
  },
});
