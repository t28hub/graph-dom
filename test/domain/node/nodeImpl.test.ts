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

import 'reflect-metadata';
import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';
import { NodeImpl, NodeType, SerializableNode } from '../../../src/domain';

jest.unmock('puppeteer');

class Node extends NodeImpl<SerializableNode> {
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
  const element = await page.$(selector);
  if (element === null) {
    throw new Error('Could not convert JavaScript Object as an ElementImpl');
  }
  return element;
}

async function createNode(page: Page, selector: string): Promise<NodeImpl<SerializableNode>> {
  const element = await findElement(page, selector);
  const properties: SerializableNode = await page.evaluate((element: HTMLElement): SerializableNode => {
    const { nodeName, nodeType, nodeValue } = element;
    return { nodeName, nodeType, nodeValue };
  }, element);
  return new Node(page, element, properties);
}

describe('NodeImpl', () => {
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

  describe('properties', () => {
    let node: Node;
    beforeAll(async () => {
      node = await createNode(page, 'p');
    });

    test('should return node name', async () => {
      // Act
      const actual = node.nodeName;

      // Assert
      expect(actual).toEqual('P');
    });

    test('should return node type', async () => {
      // Act
      const actual = node.nodeType;

      // Assert
      expect(actual).toEqual(NodeType.ELEMENT_NODE);
    });

    test('should return node value', async () => {
      // Act
      const actual = node.nodeValue;

      // Assert
      expect(actual).toEqual(null);
    });
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

  describe('children', () => {
    test('should return children nodes', async () => {
      // Act
      const node = await createNode(page, 'div');
      const actual = await node.children();

      // Assert
      expect(actual).toHaveLength(3);
      expect(actual[0].nodeName).toEqual('H1');
      expect(actual[1].nodeName).toEqual('P');
      expect(actual[2].nodeName).toEqual('P');
    });
  });

  describe('childNodes', () => {
    test('should return child nodes', async () => {
      // Act
      const node = await createNode(page, 'div');
      const actual = await node.childNodes();

      // Assert
      expect(actual).toHaveLength(7);
      expect(actual[0].nodeName).toEqual('#text');
      expect(actual[1].nodeName).toEqual('H1');
      expect(actual[2].nodeName).toEqual('#text');
      expect(actual[3].nodeName).toEqual('P');
      expect(actual[4].nodeName).toEqual('#text');
      expect(actual[5].nodeName).toEqual('P');
      expect(actual[6].nodeName).toEqual('#text');

    });
  });

  describe('firstChild', () => {
    test('should return first child node', async () => {
      // Act
      const node = await createNode(page, 'div');
      const actual = await node.firstChild();

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get().nodeName).toEqual('#text');
    });

    test('should return empty when child node does not exist', async () => {
      // Act
      const node = await createNode(page, 'meta');
      const actual = await node.firstChild();

      // Assert
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('lastChild', () => {
    test('should return last child node', async () => {
      // Act
      const node = await createNode(page, 'div');
      const actual = await node.lastChild();

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get().nodeName).toEqual('#text');
    });

    test('should return empty when child node does not exist', async () => {
      // Act
      const node = await createNode(page, 'meta');
      const actual = await node.lastChild();

      // Assert
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('nextSibling', () => {
    test('should return next node of the node in parent node', async () => {
      // Act
      const node = await createNode(page, 'h1');
      const actual = await node.nextSibling();

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get().nodeName).toEqual('#text');
    });

    test('should return empty when the node is last node', async () => {
      // Act
      const node = await createNode(page, 'html');
      const actual = await node.nextSibling();

      // Assert
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('previousSibling', () => {
    test('should return previous node of the node in parent node', async () => {
      // Act
      const node = await createNode(page, 'h1');
      const actual = await node.previousSibling();

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get().nodeName).toEqual('#text');
    });

    test('should return empty when the node is first node', async () => {
      // Act
      const node = await createNode(page, 'a');
      const actual = await node.previousSibling();

      // Assert
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('parentElement', () => {
    test('should return parent element', async () => {
      // Act
      const node = await createNode(page, 'h1');
      const actual = await node.parentElement();

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get().nodeName).toEqual('DIV');
    });

    test('should return empty when node does not have parent element', async () => {
      // Act
      const node = await createNode(page, 'html');
      const actual = await node.parentElement();

      // Assert
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('parentNode', () => {
    test('should return parent node', async () => {
      // Act
      const node = await createNode(page, 'html');
      const actual = await node.parentNode();

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get().nodeName).toEqual('#document');
    });

    test('should return empty when node does not have parent node', async () => {
      // Act
      const node = await createNode(page, 'html');
      const document = (await node.parentNode()).get();
      const actual = await document.parentNode();

      // Assert
      expect(actual.isPresent()).toBeFalsy();
    });
  });
});
