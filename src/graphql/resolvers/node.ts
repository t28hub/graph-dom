import {IResolverObject} from 'graphql-tools';
import {Document, Element, Node} from '../../dom';

export const resolver: IResolverObject = {
  __resolveType: (node: Node): string | null => {
    // noinspection JSUnusedLocalSymbols
    return node.accept<string | null>({
      visitDocument(document: Document): string {
        return Document.name;
      },
      visitElement(element: Element): string {
        return Element.name;
      },
      defaultAction(node: Node): null {
        return null;
      },
    });
  },
};
