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
import puppeteer, { browser } from '../../src/__mocks__/puppeteer';
import { BrowserProvider } from '../../src/infrastructure/browserProvider';

jest.mock('chrome-aws-lambda', () => {
  return { puppeteer };
});

describe('BrowserProvider', () => {
  const TestModule = new GraphQLModule();

  let provider!: BrowserProvider;
  beforeEach(() => {
    jest.resetAllMocks();

    provider = new BrowserProvider('/path/to/browser', true)
  });

  describe('onInit', () => {
    test('should launch browser', () => {
      // Act
      provider.onInit(TestModule);

      // Assert
      expect(puppeteer.launch).toBeCalledTimes(1);
      expect(puppeteer.launch).toBeCalledWith({
        executablePath: '/path/to/browser',
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-gpu',
          '--enable-logging',
          '--headless'
        ]
      });
    });
  });

  describe('connect', () => {
    test('should connect browser with websocket endpoint', async () => {
      // Arrange
      browser.wsEndpoint.mockReturnValue('ws://127.0.0.1:36000');
      puppeteer.launch.mockReturnValue(Promise.resolve(browser));
      puppeteer.connect.mockReturnValue(Promise.resolve(browser));
      provider.onInit(TestModule);

      // Act
      const actual = await provider.connect();

      // Assert
      expect(actual).toBeTruthy();
      expect(puppeteer.connect).toBeCalledTimes(1);
      expect(puppeteer.connect).toBeCalledWith({
        browserWSEndpoint: 'ws://127.0.0.1:36000'
      });
    });

    test('should connect browser with specified options', async () => {
      // Arrange
      browser.wsEndpoint.mockReturnValue('ws://127.0.0.1:36000');
      puppeteer.launch.mockReturnValue(Promise.resolve(browser));
      puppeteer.connect.mockReturnValue(Promise.resolve(browser));
      provider.onInit(TestModule);

      // Act
      const actual = await provider.connect({
        ignoreHTTPSErrors: true,
        slowMo: 100,
      });

      // Assert
      expect(actual).toBeTruthy();
      expect(puppeteer.connect).toBeCalledTimes(1);
      expect(puppeteer.connect).toBeCalledWith({
        browserWSEndpoint: 'ws://127.0.0.1:36000',
        ignoreHTTPSErrors: true,
        slowMo: 100,
      });
    });
  });

  describe('dispose', () => {
    test('should close shared browser', async () => {
      // Arrange
      puppeteer.launch.mockReturnValue(Promise.resolve(browser));
      provider.onInit(TestModule);

      // Act
      await provider.dispose();

      // Assert
      expect(browser.close).toBeCalledTimes(1);
    });
  });
});
