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

import { Document as IDocument, Element as IElement, Node as INode, NodeType } from '../';

export * from './node';
export * from './document';
export * from './element';

export function isDocument(node: INode): node is IDocument {
  return node.nodeType === NodeType.DOCUMENT_NODE;
}

export function isElement(node: INode): node is IElement {
  return node.nodeType === NodeType.ELEMENT_NODE;
}
