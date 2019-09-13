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
import { DOMDocument, DOMElement } from '../web';
import { Document as IDocument, SerializableDocument } from '../document';
import { Element as IElement } from '../element';
import { Node } from './node';
import { Optional } from '../../util';

export class Document extends Node<SerializableDocument> implements IDocument {
  public get title(): string {
    return this.properties.title;
  }

  public constructor(page: Page, element: ElementHandle, properties: SerializableDocument) {
    super(page, element, properties);
  }

  public async head(): Promise<Optional<IElement>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle((document: DOMDocument): DOMElement | null => {
      return document.head;
    }, element);
    return this.toElement(handle);
  }

  public async body(): Promise<Optional<IElement>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle((document: DOMDocument): DOMElement | null => {
      return document.body;
    }, element);
    return this.toElement(handle);
  }

  public async getElementById(id: string): Promise<Optional<IElement>> {
    const { page, element } = this;
    const handle = await page.evaluateHandle(
      (document: DOMDocument, id: string): HTMLElement | null => {
        return document.getElementById(id);
      },
      element,
      id
    );
    return this.toElement(handle);
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
