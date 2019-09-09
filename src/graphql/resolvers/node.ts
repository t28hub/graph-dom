import { IResolverObject } from 'graphql-tools';
import { Document, Element, Node } from '../../dom';

type Type = 'Document' | 'Element' | null;

/* eslint-disable @typescript-eslint/no-unused-vars */
export const resolver: IResolverObject = {
  __resolveType: (node: Node): Type => {
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
