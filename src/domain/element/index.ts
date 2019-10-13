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
import { Element, ElementImpl, SerializableElement } from '../';

export async function create(page: Page, element: ElementHandle): Promise<Element> {
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
  return new ElementImpl(page, element, properties);
}
