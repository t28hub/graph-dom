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

import { parse } from 'url';
import puppeteer, { browser, page } from '../../src/__mocks__/puppeteer';
import { ChromeBrowserService } from '../../src/service/chromeBrowserService';

jest.mock('../../src/util/logging');
jest.mock('../../src/dom/puppeteer');

describe('ChromeBrowserService', () => {
  let browserService!: ChromeBrowserService;
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    browser.newPage = jest.fn().mockReturnValue(Promise.resolve(page));
    puppeteer.launch.mockReturnValue(browser);
    browserService = new ChromeBrowserService({
      path: '/path/to/chrome',
      headless: true
    });
  });

  describe('open', () => {
    test('should launch browser', async () => {
      // Arrange
      page.goto = jest.fn().mockReturnValue(Promise.resolve({
        status: jest.fn().mockReturnValue(200)
      }));

      // Act
      const url = parse('https://example.com/');
      await browserService.open(url);

      // Assert
      expect(puppeteer.launch).toBeCalledWith({
        args: [],
        defaultViewport: undefined,
        executablePath: '/path/to/chrome',
        headless: true
      });
      expect(browser.newPage).toBeCalledWith();
      expect(page.goto).toBeCalledWith('https://example.com/', { waitUntil: 'load' });
    });

    test('should launch browser only once when open is called over 2 times', async () => {
      // Arrange
      page.goto = jest.fn().mockReturnValue(Promise.resolve({
        status: jest.fn().mockReturnValue(200)
      }));

      // Act
      const comUrl = parse('https://example.com/');
      await browserService.open(comUrl);

      const orgUrl = parse('https://example.org/');
      await browserService.open(orgUrl);

      // Assert
      expect(puppeteer.launch).toBeCalledTimes(1);
      expect(puppeteer.launch).toBeCalledWith({
        args: [],
        defaultViewport: undefined,
        executablePath: '/path/to/chrome',
        headless: true
      });
      expect(browser.newPage).toBeCalledTimes(2);
      expect(page.goto).toBeCalledTimes(2);
      expect(page.goto).toBeCalledWith('https://example.com/', { waitUntil: 'load' });
      expect(page.goto).toBeCalledWith('https://example.org/', { waitUntil: 'load' });
    });

    test('should set default timeout when property is set', async () => {
      // Act
      const url = parse('https://example.com/');
      const actual = await browserService.open(url, { timeout: 5000 });

      // Assert
      expect(browser.newPage).toBeCalledWith();
      expect(page.setDefaultTimeout).toBeCalledWith(5000);
    });

    test('should set userAgent when property is set', async () => {
      // Act
      const url = parse('https://example.com/');
      const actual = await browserService.open(url, { userAgent: 'CustomUserAgent/1.0.0' });

      // Assert
      expect(browser.newPage).toBeCalledWith();
      expect(page.setUserAgent).toBeCalledWith('CustomUserAgent/1.0.0');
    });

    test('should set waitUntil when property is set', async () => {
      // Act
      const url = parse('https://example.com/');
      const actual = await browserService.open(url, { waitUntil: 'networkidle2' });

      // Assert
      expect(browser.newPage).toBeCalledWith();
      expect(page.goto).toBeCalledWith('https://example.com/', { waitUntil: 'networkidle2' });
    });

    test('should throw an Error when received response is null', async () => {
      // Arrange
      page.goto = jest.fn().mockReturnValue(Promise.resolve(null));

      // Act
      const url = parse('https://example.com/');
      const actual = browserService.open(url);

      // Assert
      await expect(actual).rejects.toThrow();
    });

    test('should not throw an Error when received status is not successful', async () => {
      // Arrange
      page.goto = jest.fn().mockReturnValue(Promise.resolve({
        status: jest.fn().mockReturnValue(404)
      }));

      // Act
      const url = parse('https://example.com/');
      const actual = await browserService.open(url);

      // Assert
      await expect(actual).toBeUndefined();
    });
  });

  describe('dispose', () => {
    test('should close browser', async () => {
      // Arrange
      const url = parse('https://example.com/');
      await browserService.open(url);

      // Act
      await browserService.dispose();

      // Assert
      expect(browser.close).toBeCalledTimes(1);
      expect(browser.disconnect).toBeCalledTimes(1);
    });

    test('should close and disconnect browser when browser throws an Error', async () => {
      // Arrange
      const url = parse('https://example.com/');
      await browserService.open(url);
      browser.close = jest.fn(() => {
        throw new Error('Failed to close browser');
      });

      // Act
      await browserService.dispose();

      // Assert
      expect(browser.close).toBeCalledTimes(1);
      expect(browser.disconnect).toBeCalledTimes(1);
    });

    test('should close and disconnect browser when page throws an Error', async () => {
      // Arrange
      const url = parse('https://example.com/');
      await browserService.open(url);
      page.close = jest.fn(() => {
        throw new Error('Failed to close page');
      });
      browser.pages = jest.fn().mockReturnValue(Promise.resolve([page]));

      // Act
      await browserService.dispose();

      // Assert
      expect(browser.close).toBeCalledTimes(1);
      expect(browser.disconnect).toBeCalledTimes(1);
    });

    test('should not close when browser is not set', async () => {
      // Act
      await browserService.dispose();

      // Assert
      expect(browser.close).not.toBeCalled();
      expect(browser.disconnect).not.toBeCalled();
    });
  });
});
