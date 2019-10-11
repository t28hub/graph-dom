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
import { isElement, Document, Element } from './';
import { Element as IElement, Node as INode, NodeType, SerializableNode } from '../';
import { Optional } from '../../util';
import { HTMLNode } from '../web';

export abstract class Node<T extends SerializableNode> implements INode {
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

  public async children(): Promise<Array<INode>> {
    const { page, element } = this;
    const collection = await page.evaluateHandle(
      /* istanbul ignore next */
      (element: HTMLElement): HTMLCollection => element.children,
      element
    );
    return this.toNodeArray(collection);
  }

  public async childNodes(): Promise<Array<INode>> {
    const { page, element } = this;
    const collection = await page.evaluateHandle(
      /* istanbul ignore next */
      (element: HTMLElement): NodeListOf<ChildNode> => element.childNodes,
      element
    );
    return this.toNodeArray(collection);
  }

  public async firstChild(): Promise<Optional<INode>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle((element: HTMLElement): HTMLNode | null => {
      return element.firstChild;
    }, element);
    return this.toNode(handle);
  }

  public async lastChild(): Promise<Optional<INode>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle((element: HTMLElement): HTMLNode | null => {
      return element.lastChild;
    }, element);
    return this.toNode(handle);
  }

  public async nextSibling(): Promise<Optional<INode>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle((element: HTMLElement): HTMLNode | null => {
      return element.nextSibling;
    }, element);
    return this.toNode(handle);
  }

  public async previousSibling(): Promise<Optional<INode>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle((element: HTMLElement): HTMLNode | null => {
      return element.previousSibling;
    }, element);
    return this.toNode(handle);
  }

  public async parentElement(): Promise<Optional<IElement>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle((element: HTMLElement): HTMLNode | null => {
      return element.parentElement;
    }, element);

    const optionalNode = await this.toNode(handle);
    if (!optionalNode.isPresent()) {
      return Optional.empty();
    }
    const node = optionalNode.get();
    return Optional.ofNullable(isElement(node) ? node : null);
  }

  public async parentNode(): Promise<Optional<INode>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle((element: HTMLElement): HTMLNode | null => {
      return element.parentNode;
    }, element);
    return this.toNode(handle);
  }

  protected async getElementsByClassName(name: string): Promise<Array<IElement>> {
    const { page, element } = this;
    const collection = await page.evaluateHandle(
      (element: HTMLElement, name: string): HTMLCollection => {
        return element.getElementsByClassName(name);
      },
      element,
      name
    );
    return this.toElementArray(collection);
  }

  protected async getElementsByTagName(name: string): Promise<Array<IElement>> {
    const { page, element } = this;
    const collection = await page.evaluateHandle(
      (element: HTMLElement, name: string): HTMLCollection => {
        return element.getElementsByTagName(name);
      },
      element,
      name
    );
    return this.toElementArray(collection);
  }

  protected async querySelector(selector: string): Promise<Optional<IElement>> {
    const { element } = this;
    const found = await element.$(selector);
    return this.toElement(found);
  }

  protected async querySelectorAll(selector: string): Promise<Array<IElement>> {
    const { page, element } = this;
    const found: ElementHandle<HTMLElement>[] = await element.$$(selector);
    const promises: Promise<IElement>[] = found.map(
      async (element: ElementHandle): Promise<IElement> => {
        const node = await Node.create(page, element);
        if (isElement(node)) {
          return node;
        }
        throw new Error();
      }
    );
    return Promise.all(promises);
  }

  protected async toNode(handle: JSHandle | null): Promise<Optional<INode>> {
    if (handle === null) {
      return Optional.empty();
    }

    const element = handle.asElement();
    if (element === null) {
      return Optional.empty();
    }
    return Optional.ofNullable(await Node.create(this.page, element));
  }

  protected async toNodeArray(collection: JSHandle): Promise<Array<INode>> {
    const properties = await collection.getProperties();
    const promises = Array.from(properties.values()).map(
      async (handle: JSHandle): Promise<INode> => {
        const node = await this.toNode(handle);
        return node.orElseThrow(() => new Error('Node does not exist'));
      }
    );
    return Promise.all(promises);
  }

  protected async toElement(handle: JSHandle | null): Promise<Optional<IElement>> {
    const optionalNode = await this.toNode(handle);
    if (!optionalNode.isPresent()) {
      return Optional.empty();
    }

    const node = optionalNode.get();
    return Optional.ofNullable(isElement(node) ? node : null);
  }

  protected async toElementArray(collection: JSHandle): Promise<Array<IElement>> {
    const properties = await collection.getProperties();
    const promises = Array.from(properties.values()).map(
      async (handle: JSHandle): Promise<IElement> => {
        const node = await this.toElement(handle);
        return node.orElseThrow(() => new Error('Element does not exist'));
      }
    );
    return Promise.all(promises);
  }

  protected static async create(page: Page, element: ElementHandle): Promise<INode> {
    const nodeType = await page.evaluate(
      /* istanbul ignore next */
      (element: HTMLElement): NodeType => element.nodeType,
      element
    );

    switch (nodeType) {
      case NodeType.DOCUMENT_NODE:
        return await Document.create(page, element);
      case NodeType.ELEMENT_NODE:
        return await Element.create(page, element);
      default:
        // TODO: Instantiate strict class for node type
        return await Element.create(page, element);
    }
  }
}
