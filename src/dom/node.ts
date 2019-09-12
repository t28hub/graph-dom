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

import { Document } from './document';
import { Element } from './element';

export interface Node {
  readonly nodeName: string;
  readonly nodeType: NodeType;
  readonly nodeValue: string | null;
  readonly textContent: string | null;

  accept<R>(visitor: Visitor<R>): R;

  children(): Promise<Array<Node>>;

  childNodes(): Promise<Array<Node>>;

  firstChild(): Promise<Node | null>;

  lastChild(): Promise<Node | null>;

  parentNode(): Promise<Node | null>;

  parentElement(): Promise<Element | null>;

  nextSibling(): Promise<Node | null>;

  previousSibling(): Promise<Node | null>;
}

export type SerializableNode = Pick<Node, 'nodeName' | 'nodeType' | 'nodeValue' | 'textContent'>;

export enum NodeType {
  // noinspection JSUnusedGlobalSymbols
  ELEMENT_NODE = 1,
  ATTRIBUTE_NODE,
  TEXT_NODE,
  CDATA_SECTION_NODE,
  ENTITY_REFERENCE_NODE,
  ENTITY_NODE,
  PROCESSING_INSTRUCTION_NODE,
  COMMENT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_TYPE_NODE,
  DOCUMENT_FRAGMENT_NODE,
  NOTATION_NODE,
}

export interface Visitor<T> {
  visitElement(element: Element): T;

  visitDocument(document: Document): T;

  defaultAction(node: Node): T;
}
