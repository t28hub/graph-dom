import {IResolverObject} from 'graphql-tools';
import {Document, Element, Node} from '../../dom';

type Type = 'Document' | 'Element' | null;

export const resolver: IResolverObject = {
  __resolveType: (node: Node): Type => {
    // noinspection JSUnusedLocalSymbols
    return node.accept<Type>({
      visitDocument(document: Document): Type {
        return 'Document';
      },
      visitElement(element: Element): Type {
        return 'Element';
      },
      defaultAction(node: Node): Type {
        return null;
      },
    });
  },
};
