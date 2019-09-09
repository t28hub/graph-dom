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
import { Document, Element, Node, NodeType } from '../../dom';

export const resolver: IResolverObject = {
  head: async (document: Document): Promise<Element | null> => {
    return document.head();
  },
  body: async (document: Document): Promise<Element | null> => {
    return document.body();
  },
  children: async (document: Document): Promise<Array<Node>> => {
    return document.children();
  },
  childNodes: async (document: Document): Promise<Array<Node>> => {
    return document.childNodes();
  },
  firstChild: async (document: Document): Promise<Node | null> => {
    return document.firstChild();
  },
  lastChild: async (document: Document): Promise<Node | null> => {
    return document.lastChild();
  },
  nextSibling: async (document: Document): Promise<Node | null> => {
    return document.nextSibling();
  },
  previousSibling: async (document: Document): Promise<Node | null> => {
    return document.previousSibling();
  },
  parentElement: async (document: Document): Promise<Element | null> => {
    return document.parentElement();
  },
  parentNode: async (document: Document): Promise<Node | null> => {
    return document.parentNode();
  },
  nodeType: (document: Document): string => {
    const { nodeType } = document;
    return NodeType[nodeType];
  },
  getElementById: async (document: Document, args: { id: string }): Promise<Element | null> => {
    const { id } = args;
    return document.getElementById(id);
  },
  getElementsByClassName: async (document: Document, args: { name: string }): Promise<Array<Element>> => {
    const { name } = args;
    return document.getElementsByClassName(name);
  },
  getElementsByTagName: async (document: Document, args: { name: string }): Promise<Array<Element>> => {
    const { name } = args;
    return document.getElementsByTagName(name);
  },
  querySelector: async (document: Document, args: { selector: string }): Promise<Element | null> => {
    const { selector } = args;
    return document.querySelector(selector);
  },
  querySelectorAll: async (document: Document, args: { selector: string }): Promise<Array<Element>> => {
    const { selector } = args;
    return document.querySelectorAll(selector);
  },
};
