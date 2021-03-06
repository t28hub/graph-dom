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
import { Attribute, Data, Element, Node, NodeType } from '..';
import { check } from '../../util';

// noinspection JSUnusedGlobalSymbols
export const resolver: IResolverObject = {
  attributes: async (element: Element): Promise<Array<Attribute>> => {
    return element.attributes();
  },
  children: async (element: Element): Promise<Array<Node>> => {
    return element.children();
  },
  childNodes: async (element: Element): Promise<Array<Node>> => {
    return element.childNodes();
  },
  firstChild: async (element: Element): Promise<Node | null> => {
    const firstChild = await element.firstChild();
    return firstChild.orElse(null);
  },
  lastChild: async (element: Element): Promise<Node | null> => {
    const lastChild = await element.lastChild();
    return lastChild.orElse(null);
  },
  nextSibling: async (element: Element): Promise<Node | null> => {
    const nextSibling = await element.nextSibling();
    return nextSibling.orElse(null);
  },
  previousSibling: async (element: Element): Promise<Node | null> => {
    const previousSibling = await element.previousSibling();
    return previousSibling.orElse(null);
  },
  parentElement: async (element: Element): Promise<Element | null> => {
    const parentElement = await element.parentElement();
    return parentElement.orElse(null);
  },
  parentNode: async (element: Element): Promise<Node | null> => {
    const parentNode = await element.parentNode();
    return parentNode.orElse(null);
  },
  dataset: async (element: Element): Promise<Array<Data>> => {
    return element.dataset();
  },
  textContent: async (element: Element): Promise<string> => {
    return element.textContent();
  },
  innerText: async (element: Element): Promise<string> => {
    return element.innerText();
  },
  innerHTML: async (element: Element): Promise<string> => {
    return element.innerHTML();
  },
  outerHTML: async (element: Element): Promise<string> => {
    return element.outerHTML();
  },
  nodeType: (element: Element): string => {
    const { nodeType } = element;
    return NodeType[nodeType];
  },
  getAttribute: async (element: Element, args: { name: string }): Promise<string | null> => {
    const { name } = args;
    check(name.length !== 0, 'Attribute name must contain at least 1 char');

    const attribute = await element.getAttribute(name);
    return attribute.orElse(null);
  },
  getElementsByClassName: async (element: Element, args: { name: string }): Promise<Array<Element>> => {
    const { name } = args;
    check(name.length !== 0, 'Class name must contain at least 1 char');

    return element.getElementsByClassName(name);
  },
  getElementsByTagName: async (element: Element, args: { name: string }): Promise<Array<Element>> => {
    const { name } = args;
    check(name.length !== 0, 'Tag name must contain at least 1 char');

    return element.getElementsByTagName(name);
  },
  querySelector: async (element: Element, args: { selector: string }): Promise<Element | null> => {
    const { selector } = args;
    check(selector.length !== 0, 'Selector must contain at least 1 char');

    const selected = await element.querySelector(selector);
    return selected.orElse(null);
  },
  querySelectorAll: async (element: Element, args: { selector: string }): Promise<Array<Element>> => {
    const { selector } = args;
    check(selector.length !== 0, 'Selector must contain at least 1 char');

    return await element.querySelectorAll(selector);
  },
};
