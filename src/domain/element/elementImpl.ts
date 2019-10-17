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
import { Attribute, Data, Element, SerializableElement, NodeImpl } from '..';
import { Optional } from '../../util';

export class ElementImpl extends NodeImpl<SerializableElement> implements Element {
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
    return await page.evaluate(
      /* istanbul ignore next */
      (element: HTMLElement): Array<Attribute> => {
        /* eslint-disable-next-line @typescript-eslint/typedef */
        return Array.from(element.attributes, ({ name, value }): Attribute => ({ name, value }));
      },
      element
    );
  }

  public async dataset(): Promise<Array<Data>> {
    const { page, element } = this;
    return await page.evaluate(
      /* istanbul ignore next */
      (element: HTMLElement): Array<Data> => {
        const dataset = element.dataset;
        return Object.keys(dataset).map((key: string): Data => ({ name: key, value: dataset[key] }));
      },
      element
    );
  }

  public async innerHTML(): Promise<string> {
    const { page, element } = this;
    return await page.evaluate(
      /* istanbul ignore next */
      (element: HTMLElement): string => element.innerHTML,
      element
    );
  }

  public async outerHTML(): Promise<string> {
    const { page, element } = this;
    return await page.evaluate(
      /* istanbul ignore next */
      (element: HTMLElement): string => element.outerHTML,
      element
    );
  }

  public async getAttribute(name: string): Promise<Optional<string>> {
    const { page, element } = this;
    const attribute = await page.evaluate(
      /* istanbul ignore next */
      (element: HTMLElement, name: string): string | null => element.getAttribute(name),
      element,
      name
    );
    return Optional.ofNullable(attribute);
  }

  public async getElementsByClassName(name: string): Promise<Array<Element>> {
    return super.getElementsByClassName(name);
  }

  public async getElementsByTagName(name: string): Promise<Array<Element>> {
    return super.getElementsByTagName(name);
  }

  public async querySelector(selector: string): Promise<Optional<Element>> {
    return super.querySelector(selector);
  }

  public async querySelectorAll(selector: string): Promise<Array<Element>> {
    return super.querySelectorAll(selector);
  }
}
