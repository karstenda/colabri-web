import { TextElement } from '../../api/ColabriAPI';
import { statementTextSchema } from '../components/ColabTextEditor/schemas/StatementTextSchema';
import { DOMSerializer, Schema, Node } from 'prosemirror-model';

export const objToProseMirrorNode = (
  schema: Schema,
  obj: any,
): Node | Node[] | null => {
  let retval: Node | Node[] | null = null;

  if (typeof obj === 'object') {
    const attributes = obj.attributes || {};
    const children = obj.children || [];
    const nodeName = obj.nodeName;

    if (nodeName == null || typeof nodeName !== 'string') {
      throw new Error('Invalid nodeName');
    }

    if (!Array.isArray(children)) {
      throw new Error('Invalid children');
    }

    const mappedChildren = children
      .flatMap((child) => objToProseMirrorNode(schema, child as any))
      .filter((n) => n !== null);

    try {
      retval = schema.node(nodeName, attributes, mappedChildren);
    } catch (e) {
      // An error occurred while creating the node.
      // This is probably a result of a concurrent action.
      console.error(e);
    }
  } else if (typeof obj === 'string') {
    retval = [];
    retval.push(schema.text(obj, []));
  } else {
    /* v8 ignore next */
    throw new Error('Invalid type');
  }

  return retval;
};

export const textElementToHTML = (textElement: TextElement): string => {
  // Convert the TextElement to a ProseMirror node object
  const proseMirrorNode = objToProseMirrorNode(
    statementTextSchema,
    textElement,
  ) as Node;

  // Serialize the ProseMirror node to a document fragment
  //const doc = statementTextSchema.nodeFromJSON(proseMirrorNode);
  const fragment = DOMSerializer.fromSchema(
    statementTextSchema,
  ).serializeFragment(proseMirrorNode.content || []);

  // Convert the fragment to an HTML string
  const div = document.createElement('div');
  div.appendChild(fragment);
  return div.innerHTML;
};
