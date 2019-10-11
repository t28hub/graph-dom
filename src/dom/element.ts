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

import { Node, SerializableNode } from './';
import { Attribute } from './attribute';
import { Data } from './data';
import { Optional } from '../util';

export interface Element extends Node {
  readonly id: string;
  readonly className: string;
  readonly classList: Array<string>;

  attributes(): Promise<Array<Attribute>>;

  dataset(): Promise<Array<Data>>;

  innerHTML(): Promise<string>;

  outerHTML(): Promise<string>;

  getAttribute(name: string): Promise<Optional<string>>;

  getElementsByClassName(name: string): Promise<Array<Element>>;

  getElementsByTagName(name: string): Promise<Array<Element>>;

  querySelector(selector: string): Promise<Optional<Element>>;

  querySelectorAll(selector: string): Promise<Array<Element>>;
}

export type SerializableElement = Pick<Element, 'id' | 'className' | 'classList' | keyof SerializableNode>;
