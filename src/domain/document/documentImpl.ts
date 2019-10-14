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
import { Document, Element, NodeImpl, SerializableDocument } from '..';
import { Optional } from '../../util';

export class DocumentImpl extends NodeImpl<SerializableDocument> implements Document {
  public get title(): string {
    return this.properties.title;
  }

  public constructor(page: Page, element: ElementHandle, properties: SerializableDocument) {
    super(page, element, properties);
  }

  public async head(): Promise<Optional<Element>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle(
      /* istanbul ignore next */
      (document: HTMLDocument): HTMLElement | null => document.head,
      element
    );
    return this.toElement(handle);
  }

  public async body(): Promise<Optional<Element>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle(
      /* istanbul ignore next */
      (document: HTMLDocument): HTMLElement | null => document.body,
      element
    );
    return this.toElement(handle);
  }

  public async getElementById(id: string): Promise<Optional<Element>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle(
      /* istanbul ignore next */
      (document: HTMLDocument, id: string): HTMLElement | null => document.getElementById(id),
      element,
      id
    );
    return this.toElement(handle);
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
