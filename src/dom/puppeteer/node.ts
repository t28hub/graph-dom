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
import { Element as IElement } from '../element';
import { Node as INode, NodeType, SerializableNode, Visitor } from '../node';
import { DOMElement, DOMNode } from '../web';

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

  public get textContent(): string | null {
    return this.properties.textContent;
  }

  protected readonly page: Page;
  protected readonly element: ElementHandle;
  protected readonly properties: T;

  protected constructor(page: Page, element: ElementHandle, properties: T) {
    this.page = page;
    this.element = element;
    this.properties = properties;
  }

  public async children(): Promise<Array<IElement>> {
    const { page, element } = this;
    const collection = await page.evaluateHandle((element: DOMElement): HTMLCollection => {
      return element.children;
    }, element);
    return this.toElements(collection);
  }

  public async childNodes(): Promise<Array<IElement>> {
    const { page, element } = this;
    const collection = await page.evaluateHandle((element: DOMElement): NodeListOf<ChildNode> => {
      return element.childNodes;
    }, element);
    return this.toElements(collection);
  }

  public async firstChild(): Promise<IElement | null> {
    const { page, element } = this;
    const handle = await page.evaluateHandle((element: DOMElement): DOMNode | null => {
      return element.firstChild;
    }, element);
    return handle !== null ? this.toElement(handle) : null;
  }

  public async lastChild(): Promise<IElement | null> {
    const { page, element } = this;
    const handle = await page.evaluateHandle((element: DOMElement): DOMNode | null => {
      return element.lastChild;
    }, element);
    return handle !== null ? this.toElement(handle) : null;
  }

  public async nextSibling(): Promise<IElement | null> {
    const { page, element } = this;
    const handle = await page.evaluateHandle((element: DOMElement): DOMNode | null => {
      return element.nextSibling;
    }, element);
    return handle !== null ? this.toElement(handle) : null;
  }

  public async previousSibling(): Promise<IElement | null> {
    const { page, element } = this;
    const handle = await page.evaluateHandle((element: DOMElement): DOMNode | null => {
      return element.previousSibling;
    }, element);
    return handle !== null ? this.toElement(handle) : null;
  }

  public async parentElement(): Promise<IElement | null> {
    const { page, element } = this;
    const handle = await page.evaluateHandle((element: DOMElement): DOMNode | null => {
      return element.parentElement;
    }, element);
    return handle !== null ? this.toElement(handle) : null;
  }

  public async parentNode(): Promise<IElement | null> {
    const { page, element } = this;
    const handle = await page.evaluateHandle((element: DOMElement): DOMNode | null => {
      return element.parentNode;
    }, element);
    return handle !== null ? this.toElement(handle) : null;
  }

  public abstract accept<R>(visitor: Visitor<R>): R;

  protected async getElementsByClassName(name: string): Promise<Array<IElement>> {
    const { page, element } = this;
    const collection = await page.evaluateHandle(
      (element: DOMElement, name: string): HTMLCollection => {
        return element.getElementsByClassName(name);
      },
      element,
      name
    );
    return this.toElements(collection);
  }

  protected async getElementsByTagName(name: string): Promise<Array<IElement>> {
    const { page, element } = this;
    const collection = await page.evaluateHandle(
      (element: DOMElement, name: string): HTMLCollection => {
        return element.getElementsByTagName(name);
      },
      element,
      name
    );
    return this.toElements(collection);
  }

  protected async querySelector(selector: string): Promise<IElement | null> {
    const { page, element } = this;
    const found = await element.$(selector);
    return found === null ? null : await this.createElement(page, found);
  }

  protected async querySelectorAll(selector: string): Promise<Array<IElement>> {
    const { page, element } = this;
    const found: ElementHandle<DOMElement>[] = await element.$$(selector);
    const promises: Promise<IElement>[] = found.map(
      async (element: ElementHandle): Promise<IElement> => {
        return await this.createElement(page, element);
      }
    );
    return Promise.all(promises);
  }

  protected async toElement(handle: JSHandle): Promise<IElement | null> {
    const element = handle.asElement();
    return element === null ? null : await this.createElement(this.page, element);
  }

  protected async toElements(collection: JSHandle): Promise<Array<IElement>> {
    const properties = await collection.getProperties();
    const promises = Array.from(properties.values())
      .map((handle: JSHandle): ElementHandle | null => handle.asElement())
      .filter((element: ElementHandle | null): boolean => element !== null)
      .map(
        async (element: ElementHandle | null): Promise<IElement> => {
          if (element === null) {
            throw new Error();
          }
          return await this.createElement(this.page, element);
        }
      );
    return Promise.all(promises);
  }

  // Avoid circular dependency between Node, Document and Element
  protected abstract async createElement(page: Page, element: ElementHandle): Promise<IElement>;
}
