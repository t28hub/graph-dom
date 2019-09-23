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
import { validateClassName, validateId, validateSelector, validateTagName } from '../../validator';

export const resolver: IResolverObject = {
  head: async (document: Document): Promise<Element | null> => {
    const head = await document.head();
    return head.orElse(null);
  },
  body: async (document: Document): Promise<Element | null> => {
    const body = await document.body();
    return body.orElse(null);
  },
  children: async (document: Document): Promise<Array<Node>> => {
    return document.children();
  },
  childNodes: async (document: Document): Promise<Array<Node>> => {
    return document.childNodes();
  },
  firstChild: async (document: Document): Promise<Node | null> => {
    const firstChild = await document.firstChild();
    return firstChild.orElse(null);
  },
  lastChild: async (document: Document): Promise<Node | null> => {
    const lastChild = await document.lastChild();
    return lastChild.orElse(null);
  },
  nextSibling: async (document: Document): Promise<Node | null> => {
    const nextSibling = await document.nextSibling();
    return nextSibling.orElse(null);
  },
  previousSibling: async (document: Document): Promise<Node | null> => {
    const previousSibling = await document.previousSibling();
    return previousSibling.orElse(null);
  },
  parentElement: async (document: Document): Promise<Element | null> => {
    const parentElement = await document.parentElement();
    return parentElement.orElse(null);
  },
  parentNode: async (document: Document): Promise<Node | null> => {
    const parentNode = await document.parentNode();
    return parentNode.orElse(null);
  },
  nodeType: (document: Document): string => {
    const { nodeType } = document;
    return NodeType[nodeType];
  },
  getElementById: async (document: Document, args: { id: string }): Promise<Element | null> => {
    const { id } = args;
    validateId(id);
    const element = await document.getElementById(id);
    return element.orElse(null);
  },
  getElementsByClassName: async (document: Document, args: { name: string }): Promise<Array<Element>> => {
    const { name } = args;
    validateClassName(name);
    return document.getElementsByClassName(name);
  },
  getElementsByTagName: async (document: Document, args: { name: string }): Promise<Array<Element>> => {
    const { name } = args;
    validateTagName(name);
    return document.getElementsByTagName(name);
  },
  querySelector: async (document: Document, args: { selector: string }): Promise<Element | null> => {
    const { selector } = args;
    validateSelector(selector);
    const selected = await document.querySelector(selector);
    return selected.orElse(null);
  },
  querySelectorAll: async (document: Document, args: { selector: string }): Promise<Array<Element>> => {
    const { selector } = args;
    validateSelector(selector);
    return document.querySelectorAll(selector);
  },
};
