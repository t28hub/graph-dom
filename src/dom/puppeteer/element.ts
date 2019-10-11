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
import { Node } from './';
import { Attribute } from '../attribute';
import { Data } from '../data';
import { Element as IElement, SerializableElement } from '../element';
import { Optional } from '../../util';

export class Element extends Node<SerializableElement> implements IElement {
  public static async create(page: Page, element: ElementHandle): Promise<IElement> {
    const properties = await page.evaluate(
      /* istanbul ignore next */
      (element: HTMLElement): SerializableElement => {
        const { id, className, classList, nodeName, nodeType, nodeValue } = element;
        return {
          id: id,
          className: className,
          classList: Array.from(classList || []),
          nodeName,
          nodeType,
          nodeValue,
        };
      },
      element
    );
    return new Element(page, element, properties);
  }

  public get id(): string {
    return this.properties.id;
  }

  public get className(): string {
    return this.properties.className;
  }

  public get classList(): Array<string> {
    return this.properties.classList;
  }

  public constructor(page: Page, element: ElementHandle, properties: SerializableElement) {
    super(page, element, properties);
  }

  public async attributes(): Promise<Array<Attribute>> {
    const { page, element } = this;
    return await page.evaluate((element: HTMLElement): Array<Attribute> => {
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
    return await page.evaluate((element: HTMLElement): Array<Data> => {
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
    return await page.evaluate((element: HTMLElement): string => element.innerHTML, element);
  }

  public async outerHTML(): Promise<string> {
    const { page, element } = this;
    return await page.evaluate((element: HTMLElement): string => element.outerHTML, element);
  }

  public async getAttribute(name: string): Promise<Optional<string>> {
    const { page, element } = this;
    const attribute = await page.evaluate(
      (element: HTMLElement, name: string): string | null => {
        return element.getAttribute(name);
      },
      element,
      name
    );
    return Optional.ofNullable(attribute);
  }

  public async getElementsByClassName(name: string): Promise<Array<IElement>> {
    return super.getElementsByClassName(name);
  }

  public async getElementsByTagName(name: string): Promise<Array<IElement>> {
    return super.getElementsByTagName(name);
  }

  public async querySelector(selector: string): Promise<Optional<IElement>> {
    return super.querySelector(selector);
  }

  public async querySelectorAll(selector: string): Promise<Array<IElement>> {
    return super.querySelectorAll(selector);
  }
}
