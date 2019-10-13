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
import { Node, NodeType } from '..';
import { create as createDocument } from '../document';
import { create as createElement } from '../element';

export async function create(page: Page, element: ElementHandle): Promise<Node> {
  const nodeType = await page.evaluate(
    /* istanbul ignore next */
    (element: HTMLElement): NodeType => element.nodeType,
    element
  );

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
