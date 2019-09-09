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
import { Node, SerializableNode } from './node';

export interface Document extends Node {
  readonly title: string;

  head(): Promise<Element | null>;

  body(): Promise<Element | null>;

  getElementById(id: string): Promise<Element | null>;

  getElementsByClassName(name: string): Promise<Array<Element>>;

  getElementsByTagName(name: string): Promise<Array<Element>>;

  querySelector(selector: string): Promise<Element | null>;

  querySelectorAll(selector: string): Promise<Array<Element>>;
}

export type SerializableDocument = Pick<Document, 'title' | keyof SerializableNode>;
