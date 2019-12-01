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

import { ElementHandle, JSHandle, Page } from 'puppeteer';
import { create } from '.';
import { HTMLNode } from './htmlNode';
import { Element, Node, NodeType, SerializableNode } from '..';
import { Optional } from '../../util';
import { InvalidSelectorError } from '../errors';

function isElement(node: Node): node is Element {
  return node.nodeType === NodeType.ELEMENT_NODE;
}

export abstract class NodeImpl<T extends SerializableNode> implements Node {
  public get nodeName(): string {
    return this.properties.nodeName;
  }

  public get nodeType(): NodeType {
    return this.properties.nodeType;
  }

  public get nodeValue(): string | null {
    return this.properties.nodeValue;
  }

  protected readonly page: Page;
  protected readonly element: ElementHandle;
  protected readonly properties: T;

  protected constructor(page: Page, element: ElementHandle, properties: T) {
    this.page = page;
    this.element = element;
    this.properties = properties;
  }

  public async textContent(): Promise<string> {
    const { page, element } = this;
    return await page.evaluate(
      /* istanbul ignore next */
      (element: HTMLElement): string => element.textContent || '',
      element
    );
  }

  public async innerText(): Promise<string> {
    const { page, element } = this;
    return await page.evaluate(
      /* istanbul ignore next */
      (element: HTMLElement): string => element.innerText,
      element
    );
  }

  public async children(): Promise<Array<Node>> {
    const { page, element } = this;
    const collection = await page.evaluateHandle(
      /* istanbul ignore next */
      (element: HTMLElement): HTMLCollection => element.children,
      element
    );
    return this.toNodeArray(collection);
  }

  public async childNodes(): Promise<Array<Node>> {
    const { page, element } = this;
    const collection = await page.evaluateHandle(
      /* istanbul ignore next */
      (element: HTMLElement): NodeListOf<ChildNode> => element.childNodes,
      element
    );
    return this.toNodeArray(collection);
  }

  public async firstChild(): Promise<Optional<Node>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle(
      /* istanbul ignore next */
      (element: HTMLElement): HTMLNode | null => element.firstChild,
      element
    );
    return this.toNode(handle);
  }

  public async lastChild(): Promise<Optional<Node>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle(
      /* istanbul ignore next */
      (element: HTMLElement): HTMLNode | null => element.lastChild,
      element
    );
    return this.toNode(handle);
  }

  public async nextSibling(): Promise<Optional<Node>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle(
      /* istanbul ignore next */
      (element: HTMLElement): HTMLNode | null => element.nextSibling,
      element
    );
    return this.toNode(handle);
  }

  public async previousSibling(): Promise<Optional<Node>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle(
      /* istanbul ignore next */
      (element: HTMLElement): HTMLNode | null => element.previousSibling,
      element
    );
    return this.toNode(handle);
  }

  public async parentElement(): Promise<Optional<Element>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle(
      /* istanbul ignore next */
      (element: HTMLElement): HTMLNode | null => element.parentElement,
      element
    );

    const optionalNode = await this.toNode(handle);
    if (!optionalNode.isPresent()) {
      return Optional.empty();
    }
    const node = optionalNode.get();
    return Optional.ofNullable(isElement(node) ? node : null);
  }

  public async parentNode(): Promise<Optional<Node>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle(
      /* istanbul ignore next */
      (element: HTMLElement): HTMLNode | null => element.parentNode,
      element
    );
    return this.toNode(handle);
  }

  protected async getElementsByClassName(name: string): Promise<Array<Element>> {
    const { page, element } = this;
    const collection = await page.evaluateHandle(
      /* istanbul ignore next */
      (element: HTMLElement, name: string): HTMLCollection => element.getElementsByClassName(name),
      element,
      name
    );
    return this.toElementArray(collection);
  }

  protected async getElementsByTagName(name: string): Promise<Array<Element>> {
    const { page, element } = this;
    const collection = await page.evaluateHandle(
      /* istanbul ignore next */
      (element: HTMLElement, name: string): HTMLCollection => element.getElementsByTagName(name),
      element,
      name
    );
    return this.toElementArray(collection);
  }

  protected async querySelector(selector: string): Promise<Optional<Element>> {
    const { element } = this;
    try {
      const found = await element.$(selector);
      return this.toElement(found);
    } catch (e) {
      throw new InvalidSelectorError(`Failed to execute 'querySelector': '${selector}' is not a valid selector`);
    }
  }

  protected async querySelectorAll(selector: string): Promise<Array<Element>> {
    const { element } = this;
    try {
      const found: ElementHandle<HTMLElement>[] = await element.$$(selector);
      const promises: Promise<Element>[] = found.map(
        async (element: ElementHandle): Promise<Element> => {
          const converted = await this.toElement(element);
          return converted.orElseThrow(() => new TypeError('Could not convert ElementHandle to Element'));
        }
      );
      return await Promise.all(promises);
    } catch (e) {
      throw new InvalidSelectorError(`Failed to execute 'querySelectorAll': '${selector}' is not a valid selector`);
    }
  }

  protected async toNode(handle: JSHandle | null): Promise<Optional<Node>> {
    if (handle === null) {
      return Optional.empty();
    }

    const element = handle.asElement();
    if (element === null) {
      return Optional.empty();
    }
    return Optional.ofNullable(await create(this.page, element));
  }

  protected async toNodeArray(collection: JSHandle): Promise<Array<Node>> {
    const properties = await collection.getProperties();
    const promises = Array.from(properties.values()).map(
      async (handle: JSHandle): Promise<Node> => {
        const node = await this.toNode(handle);
        return node.orElseThrow(() => new Error('NodeImpl does not exist'));
      }
    );
    return Promise.all(promises);
  }

  protected async toElement(handle: JSHandle | null): Promise<Optional<Element>> {
    const optionalNode = await this.toNode(handle);
    if (!optionalNode.isPresent()) {
      return Optional.empty();
    }

    const node = optionalNode.get();
    return Optional.ofNullable(isElement(node) ? node : null);
  }

  protected async toElementArray(collection: JSHandle): Promise<Array<Element>> {
    const properties = await collection.getProperties();
    const promises = Array.from(properties.values()).map(
      async (handle: JSHandle): Promise<Element> => {
        const node = await this.toElement(handle);
        return node.orElseThrow(() => new Error('ElementImpl does not exist'));
      }
    );
    return Promise.all(promises);
  }
}
