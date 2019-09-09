/*
 * Copyright 2019 Tatsuya Maki
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
