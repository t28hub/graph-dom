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

import puppeteer, { Browser, Page } from 'puppeteer';
import { Document, DocumentImpl } from '../../../src/domain';
import { create } from '../../../src/domain/document';

jest.unmock('puppeteer');

// language=html
const html = `
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <title>This is title</title>
  </head>
  <body>
  <div id="content">
    <p class="paragraph">This is 1st paragraph</p>
    <p class="paragraph">This is 2nd paragraph</p>
    <p><a href="https://example.com">Example domain</a></p>
  </div>
  </body>
  </html>
`;

describe('DocumentImpl', () => {
  let browser: Browser;
  let page: Page;
  beforeAll(async () => {
    browser = await puppeteer.launch({
      executablePath: puppeteer.executablePath(),
      headless: true,
      args: ['--no-sandbox', '--disable-gpu', '--headless']
    });

    page = await browser.newPage();
  });

  let document: Document;
  beforeEach(async ()=> {
    await page.setContent(html, { waitUntil: 'load' });
    document = await create(page);
  });

  afterAll(async () => {
    await page.close();
    await browser.close();
  });

  describe('title', () => {
    test('should return title of document', async () => {
      // Act
      const actual = document.title;

      // Assert
      expect(actual).toEqual('This is title');
    });

    test('should return empty string when title is missing', async () => {
      // Arrange
      // noinspection HtmlRequiredTitleElement
      await page.setContent(
        // language=html
          `
            <html lang="en">
            <head>
            </head>
            </html>
        `,
        { waitUntil: 'load' }
      );
      const document = await create(page);

      // Act
      const actual = document.title;

      // Assert
      expect(actual).toEqual('');
    });
  });

  describe('head', () => {
    test('should return "head" element of document', async () => {
      // Act
      const actual = await document.head();

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get().nodeName).toEqual('HEAD');
    });

    test('should return "head" element when "head" element is missing', async () => {
      // Arrange
      await page.setContent('', { waitUntil: 'load' });
      const document = await create(page);

      // Act
      const actual = await document.head();

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get().nodeName).toEqual('HEAD');
    });
  });

  describe('body', () => {
    test('should return <body> element of document', async () => {
      // Act
      const actual = await document.body();

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get().nodeName).toEqual('BODY');
    });

    test('should return <body> element when <body> element is missing', async () => {
      // Arrange
      await page.setContent('', { waitUntil: 'load' });
      const document = await create(page);

      // Act
      const actual = await document.body();

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get().nodeName).toEqual('BODY');
    });
  });

  describe('getElementById', () => {
    test('should return element matching specified ID', async () => {
      // Act
      const actual = await document.getElementById('content');

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get().nodeName).toEqual('DIV');
    });

    test('should return empty when id does not match any element', async () => {
      // Act
      const actual = await document.getElementById('wrapper');

      // Assert
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('getElementsByClassName', () => {
    test('should return elements matching specified class name', async () => {
      // Act
      const actual = await document.getElementsByClassName('paragraph');

      // Assert
      expect(actual).toHaveLength(2);
      expect(actual[0].nodeName).toEqual('P');
      expect(actual[1].nodeName).toEqual('P');
    });

    test('should return empty array when class name does not match any element', async () => {
      // Act
      const actual = await document.getElementsByClassName('header');

      // Assert
      expect(actual).toHaveLength(0);
    });
  });

  describe('getElementsByTagName', () => {
    test('should return elements matching specified tag name', async () => {
      // Act
      const actual = await document.getElementsByTagName('p');

      // Assert
      expect(actual).toHaveLength(3);
      expect(actual[0].nodeName).toEqual('P');
      expect(actual[1].nodeName).toEqual('P');
      expect(actual[2].nodeName).toEqual('P');
    });

    test('should return empty array when tag name does not match any element', async () => {
      // Act
      const actual = await document.getElementsByTagName('img');

      // Assert
      expect(actual).toHaveLength(0);
    });
  });

  describe('querySelector', () => {
    test('should return element matching specified selector', async () => {
      // Act
      const actual = await document.querySelector('div#content > *');

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get().nodeName).toEqual('P');
    });

    test('should return empty when selector does not match any element', async () => {
      // Act
      const actual = await document.querySelector('div#content > a');

      // Assert
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('querySelectorAll', () => {
    test('should return elements matching specified selector', async () => {
      // Act
      const actual = await document.querySelectorAll('div#content > *');

      // Assert
      expect(actual).toHaveLength(3);
      expect(actual[0].nodeName).toEqual('P');
      expect(actual[1].nodeName).toEqual('P');
      expect(actual[2].nodeName).toEqual('P');
    });

    test('should return empty array when selector does not match any element', async () => {
      // Act
      const actual = await document.querySelectorAll('div#content > a');

      // Assert
      expect(actual).toHaveLength(0);
    });
  });
});
