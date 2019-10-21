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
import { ElementImpl, SerializableElement } from '../../../src/domain';

jest.unmock('puppeteer');

// language=html
const html = `
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta property="og:title" content="This is title">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.example.com">
    <meta property="og:description" content="This is description">
    <title>This is title</title>
  </head>
  <body>
  <div id="content">
    <p class="paragraph new" data-type="text">This is 1st paragraph</p>
    <p class="paragraph" data-type="text" data-name="demo">This is 2nd paragraph</p>
    <p><a href="https://example.com">Example domain</a></p>
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

async function createElement(page: Page, selector: string): Promise<ElementImpl> {
  const element = await findElement(page, selector);
  const properties: SerializableElement = await page.evaluate((element: HTMLElement): SerializableElement => {
    const { id, className, classList, nodeName, nodeType, nodeValue } = element;
    return {
      id,
      className,
      classList: Array.from(classList || []),
      nodeName,
      nodeType,
      nodeValue
    };
  }, element);
  return new ElementImpl(page, element, properties);
}

describe('ElementImpl', () => {
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

  describe('id', () => {
    test('should return id', async () => {
      // Act
      const element = await createElement(page, 'div#content');
      const actual = element.id;

      // Assert
      expect(actual).toEqual('content');
    });

    test('should return empty string when element has no id', async () => {
      // Act
      const element = await createElement(page, 'p');
      const actual = element.id;

      // Assert
      expect(actual).toEqual('');
    });
  });

  describe('className', () => {
    test('should return class name', async () => {
      // Act
      const element = await createElement(page, 'p.new');
      const actual = element.className;

      // Assert
      expect(actual).toEqual('paragraph new');
    });

    test('should return empty string when element has not class', async () => {
      // Act
      const element = await createElement(page, 'p:not(.paragraph)');
      const actual = element.className;

      // Assert
      expect(actual).toEqual('');
    });
  });

  describe('classList', () => {
    test('should return list of class name', async () => {
      // Act
      const element = await createElement(page, 'p.new');
      const actual = element.classList;

      // Assert
      expect(actual).toHaveLength(2);
      expect(actual[0]).toEqual('paragraph');
      expect(actual[1]).toEqual('new');
    });

    test('should return list of class name when element has only one class', async () => {
      // Act
      const element = await createElement(page, 'p.paragraph:not(.new)');
      const actual = element.classList;

      // Assert
      expect(actual).toHaveLength(1);
      expect(actual[0]).toEqual('paragraph');
    });

    test('should return empty string when element has no class', async () => {
      // Act
      const element = await createElement(page, 'p:not(.paragraph)');
      const actual = element.classList;

      // Assert
      expect(actual).toHaveLength(0);
    });
  });

  describe('attributes', () => {
    test('should return list of attributes', async () => {
      // Act
      const element = await createElement(page, 'meta[property="og:title"]');
      const actual = await element.attributes();

      // Assert
      expect(actual).toHaveLength(2);
      expect(actual[0]).toMatchObject({
        name: 'property',
        value: 'og:title'
      });
      expect(actual[1]).toMatchObject({
        name: 'content',
        value: 'This is title'
      });
    });

    test('should return empty list when element has no attributes', async () => {
      // Act
      const element = await createElement(page, 'title');
      const actual = await element.attributes();

      // Assert
      expect(actual).toHaveLength(0);
    });
  });

  describe('dataset', () => {
    test('should return list of dataset', async () => {
      // Act
      const element = await createElement(page, 'p.paragraph:not(.new)');
      const actual = await element.dataset();

      // Assert
      expect(actual).toHaveLength(2);
      expect(actual[0]).toMatchObject({
        name: 'type',
        value: 'text'
      });
      expect(actual[1]).toMatchObject({
        name: 'name',
        value: 'demo'
      });
    });

    test('should return empty list when element has no data attributes', async () => {
      // Act
      const element = await createElement(page, 'div#content');
      const actual = await element.dataset();

      // Assert
      expect(actual).toHaveLength(0);
    });
  });

  describe('innerHTML', () => {
    test('should return inner HTML', async () => {
      // Act
      const element = await createElement(page, 'div#content');
      const actual = await element.innerHTML();

      // Assert
      expect(actual).toEqual(`
    <p class="paragraph new" data-type="text">This is 1st paragraph</p>
    <p class="paragraph" data-type="text" data-name="demo">This is 2nd paragraph</p>
    <p><a href="https://example.com">Example domain</a></p>
  `);
    });
  });

  describe('outerHTML', () => {
    test('should return inner HTML', async () => {
      // Act
      const element = await createElement(page, 'div#content');
      const actual = await element.outerHTML();

      // Assert
      expect(actual).toEqual(`<div id="content">
    <p class="paragraph new" data-type="text">This is 1st paragraph</p>
    <p class="paragraph" data-type="text" data-name="demo">This is 2nd paragraph</p>
    <p><a href="https://example.com">Example domain</a></p>
  </div>`);
    });
  });

  describe('getAttribute', () => {
    test('should return attribute matching specified name', async () => {
      // Act
      const element = await createElement(page, 'meta:first-of-type');
      const actual = await element.getAttribute('charset');

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get()).toEqual('utf-8');
    });

    test('should return empty when element does not have attribute', async () => {
      // Act
      const element = await createElement(page, 'meta:first-of-type');
      const actual = await element.getAttribute('property');

      // Assert
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('getElementsByClassName', () => {
    test('should return elements matching specified class name', async () => {
      // Act
      const element = await createElement(page, 'div#content');
      const actual = await element.getElementsByClassName('paragraph');

      // Assert
      expect(actual).toHaveLength(2);
      expect(actual[0].nodeName).toEqual('P');
      expect(actual[1].nodeName).toEqual('P');
    });

    test('should return empty array when class name does not match any element', async () => {
      // Act
      const element = await createElement(page, 'div#content');
      const actual = await element.getElementsByClassName('header');

      // Assert
      expect(actual).toHaveLength(0);
    });
  });

  describe('getElementsByTagName', () => {
    test('should return elements matching specified tag name', async () => {
      // Act
      const element = await createElement(page, 'head');
      const actual = await element.getElementsByTagName('meta');

      // Assert
      expect(actual).toHaveLength(5);
      expect(actual[0].nodeName).toEqual('META');
      expect(actual[1].nodeName).toEqual('META');
      expect(actual[2].nodeName).toEqual('META');
      expect(actual[3].nodeName).toEqual('META');
      expect(actual[4].nodeName).toEqual('META');
    });

    test('should return empty array when tag name does not match any element', async () => {
      // Act
      const element = await createElement(page, 'head');
      const actual = await element.getElementsByTagName('style');

      // Assert
      expect(actual).toHaveLength(0);
    });
  });

  describe('querySelector', () => {
    test('should return element matching specified selector', async () => {
      // Act
      const element = await createElement(page, 'div#content');
      const actual = await element.querySelector('p.paragraph');

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get().className).toEqual('paragraph new');
    });

    test('should return empty when selector does not match any element', async () => {
      // Act
      const element = await createElement(page, 'div#content');
      const actual = await element.querySelector('.header');

      // Assert
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('querySelectorAll', () => {
    test('should return elements matching specified selector', async () => {
      // Act
      const element = await createElement(page, 'div#content');
      const actual = await element.querySelectorAll('p.paragraph');

      // Assert
      expect(actual).toHaveLength(2);
      expect(actual[0].className).toEqual('paragraph new');
      expect(actual[1].className).toEqual('paragraph');
    });

    test('should return empty when selector does not match any element', async () => {
      // Act
      const element = await createElement(page, 'div#content');
      const actual = await element.querySelectorAll('.header');

      // Assert
      expect(actual).toHaveLength(0);
    });
  });
});
