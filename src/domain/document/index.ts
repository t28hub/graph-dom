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
import { Document, DocumentImpl, SerializableDocument } from '..';

async function findDocumentElement(page: Page): Promise<ElementHandle> {
  const handle = await page.evaluateHandle((): HTMLDocument => window.document);
  if (handle === null) {
    throw new Error(`window.document does not exist in ${page.url()}`);
  }

  const document = handle.asElement();
  if (document === null) {
    throw new Error(`window.document does not exist in ${page.url()}`);
  }
  return document;
}

export async function create(page: Page, element?: ElementHandle): Promise<Document> {
  const document = element ? element : await findDocumentElement(page);
  const properties = await page.evaluate(
    /* istanbul ignore next */
    (document: HTMLDocument): SerializableDocument => {
      const { title, nodeName, nodeType, nodeValue } = document;
      return { title, nodeName, nodeType, nodeValue };
    },
    document
  );
  return new DocumentImpl(page, document, properties);
}
