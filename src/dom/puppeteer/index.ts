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
import { Document as IDocument, SerializableDocument } from '../document';
import { Document } from './document';
import { Element as IElement, SerializableElement } from '../element';
import { Element } from './element';
import { Node as INode, NodeType } from '../node';
import { DOMDocument, DOMElement } from '../web';

async function findDocument(page: Page): Promise<ElementHandle> {
  const handle = await page.evaluateHandle((): DOMDocument => window.document);
  if (handle === null) {
    throw new Error(`window.document does not exist in ${page.url()}`);
  }

  const element = handle.asElement();
  if (element === null) {
    throw new Error(`window.document does not exist in ${page.url()}`);
  }
  return element;
}

export async function createDocument(page: Page, element?: ElementHandle): Promise<IDocument> {
  const document = element ? element : await findDocument(page);
  const properties = await page.evaluate((document: DOMDocument): SerializableDocument => {
    const { title, nodeName, nodeType, nodeValue, textContent } = document;
    return { title, nodeName, nodeType, nodeValue, textContent };
  }, document);
  return new Document(page, document, properties);
}

export async function createElement(page: Page, element: ElementHandle): Promise<IElement> {
  const properties = await page.evaluate((element: DOMElement): SerializableElement => {
    const { id, className, classList, nodeName, nodeType, nodeValue, textContent } = element;
    return {
      id: id,
      className: className,
      classList: Array.from(classList || []),
      nodeName,
      nodeType,
      nodeValue,
      textContent,
    };
  }, element);
  return new Element(page, element, properties);
}

export async function create(page: Page, element: ElementHandle): Promise<INode> {
  const nodeType = await page.evaluate((element: DOMElement) => {
    return element.nodeType;
  }, element);

  switch (nodeType) {
    case NodeType.DOCUMENT_NODE:
      return await createDocument(page, element);
    case NodeType.ELEMENT_NODE:
      return await createElement(page, element);
    default:
      // TODO: Instantiate strict class for node type
      return await createElement(page, element);
  }
}

export function isDocument(node: INode): node is IDocument {
  return node.nodeType === NodeType.DOCUMENT_NODE;
}

export function isElement(node: INode): node is IElement {
  return node.nodeType === NodeType.ELEMENT_NODE;
}
