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

import { Element } from './element';
import { Optional } from '../util';

export interface Node {
  readonly nodeName: string;
  readonly nodeType: NodeType;
  readonly nodeValue: string | null;
  readonly textContent: string | null;

  children(): Promise<Array<Node>>;

  childNodes(): Promise<Array<Node>>;

  firstChild(): Promise<Optional<Node>>;

  lastChild(): Promise<Optional<Node>>;

  parentNode(): Promise<Optional<Node>>;

  parentElement(): Promise<Optional<Element>>;

  nextSibling(): Promise<Optional<Node>>;

  previousSibling(): Promise<Optional<Node>>;
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
