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
import { GraphQLModule } from '@graphql-modules/core';
import puppeteer, { browser } from '../../src/__mocks__/puppeteer-core';
import { BrowserProvider } from '../../src/infrastructure/browserProvider';

jest.mock('chrome-aws-lambda', () => {
  return { puppeteer };
});

describe('BrowserProvider', () => {
  let provider!: BrowserProvider;
  beforeEach(() => {
    jest.resetAllMocks();

    provider = new BrowserProvider('/path/to/browser', true)
  });

  describe('provide', () => {
    test('should provide browser instance with default options', async () => {
      // Arrange
      puppeteer.launch.mockReturnValue(Promise.resolve(browser));
      puppeteer.connect.mockReturnValue(Promise.resolve(browser));

      // Act
      const actual = await provider.provide();

      // Assert
      expect(actual).toBeTruthy();
      expect(puppeteer.launch).toBeCalledTimes(1);
      expect(puppeteer.launch).toBeCalledWith({
        args: expect.arrayContaining([
          '--disable-gpu',
          '--disable-setuid-sandbox',
          '--incognito',
          '--no-sandbox',
          '--single-process',
        ]),
        headless: true,
        executablePath: '/path/to/browser'
      });
    });

    test('should launch browser with specified options', async () => {
      // Arrange
      puppeteer.launch.mockReturnValue(Promise.resolve(browser));
      puppeteer.connect.mockReturnValue(Promise.resolve(browser));

      // Act
      const actual = await provider.provide({
        ignoreHTTPSErrors: true,
        slowMo: 100,
      });

      // Assert
      expect(actual).toBeTruthy();
      expect(puppeteer.launch).toBeCalledTimes(1);
      expect(puppeteer.launch).toBeCalledWith({
        args: expect.arrayContaining([
          '--disable-gpu',
          '--disable-setuid-sandbox',
          '--incognito',
          '--no-sandbox',
          '--single-process',
        ]),
        headless: true,
        executablePath: '/path/to/browser',
        ignoreHTTPSErrors: true,
        slowMo: 100,
      });
    });
  });

  describe('dispose', () => {
    test('should close launched browser', async () => {
      // Arrange
      puppeteer.launch.mockReturnValue(Promise.resolve(browser));
      const launched = await provider.provide();

      // Act
      await provider.dispose(launched);

      // Assert
      expect(browser.close).toBeCalledTimes(1);
    });

    test('should disconnect connected browser', async () => {
      // Arrange
      browser.isConnected.mockReturnValue(true);
      puppeteer.launch.mockReturnValue(Promise.resolve(browser));
      const launched = await provider.provide();

      // Act
      await provider.dispose(launched);

      // Assert
      expect(browser.disconnect).toBeCalledTimes(1);
      expect(browser.close).toBeCalledTimes(1);
    });
  });
});
