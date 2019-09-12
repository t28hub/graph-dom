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

import { ElementHandle, Page } from 'puppeteer';
import { Attribute } from '../attribute';
import { DOMElement } from '../web';
import { Data } from '../data';
import { Element as IElement, SerializableElement } from '../element';
import { Visitor } from '../node';
import { Node } from './node';

export class Element extends Node<SerializableElement> implements IElement {
  public get id(): string {
    return this.properties.id;
  }

  public get className(): string {
    return this.properties.className;
  }

  public get classList(): Array<string> {
    return this.properties.classList;
  }

  public static async create(page: Page, element: ElementHandle): Promise<Element> {
    const properties = await page.evaluate((element: DOMElement): SerializableElement => {
      const { id, className, classList, nodeName, nodeType, nodeValue, textContent } = element;
      // When type of element is DOCUMENT_TYPE_NODE, properties of SerializableElement could be missing.
      return {
        id: id || '',
        className: className || '',
        classList: Array.from(classList || []),
        nodeName,
        nodeType,
        nodeValue,
        textContent,
      };
    }, element);
    return new Element(page, element, properties);
  }

  private constructor(page: Page, element: ElementHandle, properties: SerializableElement) {
    super(page, element, properties);
  }

  public async attributes(): Promise<Array<Attribute>> {
    const { page, element } = this;
    return await page.evaluate((element: DOMElement): Array<Attribute> => {
      const items = element.attributes;
      const itemSize = items.length;
      const attributes: Array<Attribute> = [];
      for (let index = 0; index < itemSize; index++) {
        const item: Attr | null = items.item(index);
        if (item === null) {
          continue;
        }

        const { name, value } = item;
        attributes.push({ name, value });
      }
      return attributes;
    }, element);
  }

  public async dataset(): Promise<Array<Data>> {
    const { page, element } = this;
    return await page.evaluate((element: DOMElement): Array<Data> => {
      if (!(element instanceof HTMLElement)) {
        return [];
      }

      const { dataset } = element;
      return Object.keys(dataset).map(
        (name: string): Data => {
          const value = dataset[name];
          return { name, value };
        }
      );
    }, element);
  }

  public async innerHTML(): Promise<string> {
    const { page, element } = this;
    return await page.evaluate((element: DOMElement): string => element.innerHTML, element);
  }

  public async outerHTML(): Promise<string> {
    const { page, element } = this;
    return await page.evaluate((element: DOMElement): string => element.outerHTML, element);
  }

  public async getAttribute(name: string): Promise<string | null> {
    const { page, element } = this;
    return await page.evaluate(
      (element: DOMElement, name: string): string | null => {
        return element.getAttribute(name);
      },
      element,
      name
    );
  }

  public async getElementsByClassName(name: string): Promise<Array<IElement>> {
    return super.getElementsByClassName(name);
  }

  public async getElementsByTagName(name: string): Promise<Array<IElement>> {
    return super.getElementsByTagName(name);
  }

  public async querySelector(selector: string): Promise<IElement | null> {
    return super.querySelector(selector);
  }

  public async querySelectorAll(selector: string): Promise<Array<IElement>> {
    return super.querySelectorAll(selector);
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitElement(this);
  }

  protected async createElement(page: Page, element: ElementHandle): Promise<Element> {
    return Element.create(page, element);
  }
}
