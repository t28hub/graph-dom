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

import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';
import { SerializableNode } from '../../../src/dom';
import { Node } from '../../../src/dom/puppeteer';

jest.unmock('puppeteer');
jest.unmock('../../../src/dom/puppeteer');

class NodeImpl extends Node<SerializableNode> {
  public constructor(page: Page, element: ElementHandle, properties: SerializableNode) {
    super(page, element, properties);
  }
}

// language=html
const html = `
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Test HTML</title>
  </head>
  <body>
  <div>
    <h1>Title</h1>
    <p>1st paragraph
      This is 1st paragraph.</p>
    <p><a href="http://www.example.com">Example domain</a></p>
  </div>
  </body>
  </html>
`;

async function findElement(page: Page, selector: string): Promise<ElementHandle> {
  const handle = await page.evaluateHandle((selector: string): HTMLElement => {
    const found = window.document.querySelector(selector);
    if (found === null) {
      throw new Error('Could not find required element');
    }
    return found as HTMLElement;
  }, selector);

  const element = handle.asElement();
  if (element === null) {
    throw new Error('Could not convert JavaScript Object as an Element');
  }
  return element;
}

async function createNode(page: Page, selector: string): Promise<Node<SerializableNode>> {
  const element = await findElement(page, selector);
  const properties: SerializableNode = await page.evaluate((element: HTMLElement): SerializableNode => {
    const { nodeName, nodeType, nodeValue } = element;
    return { nodeName, nodeType, nodeValue };
  }, element);
  return new NodeImpl(page, element, properties);
}

describe('Node', () => {
  let browser: Browser;
  let page: Page;
  beforeAll(async () => {
    browser = await puppeteer.launch({
      executablePath: puppeteer.executablePath(),
      headless: true,
      args: ['--no-sandbox', '--disable-gpu', '--headless']
    });

    page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
  });

  afterAll(async () => {
    await page.close();
    await browser.close();
  });

  describe('textContent', () => {
    test('should return text content ', async () => {
      // Act
      const node = await createNode(page, 'p');
      const actual = await node.textContent();

      // Assert
      expect(actual).toEqual(`1st paragraph\n      This is 1st paragraph.`);
    });
  });

  describe('innerText', () => {
    test('should return rendered text content ', async () => {
      // Act
      const node = await createNode(page, 'p');
      const actual = await node.innerText();

      // Assert
      expect(actual).toEqual('1st paragraph This is 1st paragraph.');
    });
  });
});
