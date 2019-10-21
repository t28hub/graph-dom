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
import { DataSourceConfig } from 'apollo-datasource';
import each from 'jest-each';
import { NavigationOptions, Page, Response } from 'puppeteer';
import { parse, Url } from 'url';
import puppeteer, { browser, context, page, response } from '../../src/__mocks__/puppeteer';
import { BrowserDataSource, Options, LoadEvent } from '../../src/domain/browserDataSource';
import {
  InvalidUrlError, NetworkError,
  NoResponseError,
  NotAvailableError,
  RequestTimeoutError,
  SslCertificateError
} from '../../src/domain/errors';
import { BrowserProvider } from '../../src/infrastructure/browserProvider';
import { LoggerFactory } from '../../src/util/logging/loggerFactory';

class BrowserDataSourceImpl extends BrowserDataSource<any, string> {
  public constructor(browserProvider: BrowserProvider) {
    super(browserProvider, LoggerFactory.getLogger(BrowserDataSourceImpl.name));
  }

  public initialize(config: DataSourceConfig<any>): void {
  }

  protected willSendRequest(url: Url, waitUntil: LoadEvent, options: Options): void {
    return;
  }

  protected async didReceiveResponse(page: Page, response: Response): Promise<string> {
    return await response.text();
  }
}

jest.mock('chrome-aws-lambda', () => {
  return { puppeteer };
});

describe('BrowserDataSource', () => {
  const { injector } = new GraphQLModule({
    providers: [
      {
        provide: BrowserProvider,
        overwrite: true,
        useValue: {
          path: '/path/to/browser',
          headless: true,
          connect: jest.fn(),
          provideBrowser: jest.fn()
        }
      }
    ]
  });

  const url = parse('https://example.com/');
  let browserProvider: BrowserProvider;
  let dataSource: BrowserDataSource;
  beforeEach(() => {
    jest.clearAllMocks();

    context.newPage.mockReturnValue(Promise.resolve(page));
    browser.createIncognitoBrowserContext.mockReturnValue(Promise.resolve(context));

    browserProvider = injector.get(BrowserProvider);
    (browserProvider.connect as jest.Mock).mockReturnValue(browser);

    dataSource = new BrowserDataSourceImpl(browserProvider);
  });

  describe('request', () => {
    test('should throw NoResponseError when response is null', async () => {
      // Arrange
      page.goto.mockReturnValue(Promise.resolve(null));

      // Act
      const actual = dataSource.request(url);

      // Assert
      await expect(actual).rejects.toThrow(NoResponseError);
    });

    each([
      [undefined, { waitUntil: 'load' }],
      [LoadEvent.LOAD, { waitUntil: 'load' }],
      [LoadEvent.DOM_CONTENT_LOADED, { waitUntil: 'domcontentloaded' }],
      [LoadEvent.NETWORK_IDLE0, { waitUntil: 'networkidle0' }],
      [LoadEvent.NETWORK_IDLE2, { waitUntil: 'networkidle2' }]
    ]).test('should call page.goto with load event %p', async (loadEvent: LoadEvent | undefined, options: NavigationOptions) => {
      // Arrange
      page.goto.mockReturnValue(Promise.resolve(response));

      // Act
      await dataSource.request(url, loadEvent);

      // Assert
      expect(page.goto).toBeCalledTimes(1);
      expect(page.goto).toBeCalledWith('https://example.com/', options);
    });

    test('should configure request interceptor', async () => {
      // Arrange
      page.goto.mockReturnValue(Promise.resolve(response));

      // Act
      await dataSource.request(url);

      // Assert
      expect(page.setRequestInterception).toBeCalledTimes(1);
      expect(page.setRequestInterception).toBeCalledWith(true);
      expect(page.on).toBeCalledTimes(1);
      expect(page.on).toBeCalledWith('request', expect.anything());
    });

    test('should configure default timeout when timeout is set', async () => {
      // Arrange
      page.goto.mockReturnValue(Promise.resolve(response));

      // Act
      await dataSource.request(url, LoadEvent.LOAD, { timeout: 1000 });

      // Assert
      expect(page.setDefaultTimeout).toBeCalledTimes(1);
      expect(page.setDefaultTimeout).toBeCalledWith(1000);
      expect(page.setDefaultNavigationTimeout).toBeCalledTimes(1);
      expect(page.setDefaultNavigationTimeout).toBeCalledWith(1000);
    });

    test('should configure user agent when userAgent is set', async () => {
      // Arrange
      page.goto.mockReturnValue(Promise.resolve(response));

      // Act
      await dataSource.request(url, LoadEvent.LOAD, { userAgent: 'BrowserDataSource/1.0.0' });

      // Assert
      expect(page.setUserAgent).toBeCalledTimes(1);
      expect(page.setUserAgent).toBeCalledWith('BrowserDataSource/1.0.0');
    });

    test('should configure JavaScript enabled when javaScriptEnabled is set', async () => {
      // Arrange
      page.goto.mockReturnValue(Promise.resolve(response));

      // Act
      await dataSource.request(url, LoadEvent.LOAD, { javaScriptEnabled: false });

      // Assert
      expect(page.setJavaScriptEnabled).toBeCalledTimes(1);
      expect(page.setJavaScriptEnabled).toBeCalledWith(false);
    });

    test('should connect browser', async () => {
      // Arrange
      page.goto.mockReturnValue(Promise.resolve(response));

      // Act
      await dataSource.request(url);

      // Assert
      expect(browserProvider.connect).toBeCalledTimes(1);
      expect(browser.createIncognitoBrowserContext).toBeCalledTimes(1);
      expect(context.newPage).toBeCalledTimes(1);
    });

    test('should connect browser only once when request is called over 2 times', async () => {
      // Arrange
      page.goto.mockReturnValue(Promise.resolve(response));

      // Act
      await dataSource.request(url);
      await dataSource.request(url);

      // Assert
      expect(browserProvider.connect).toBeCalledTimes(1);
      expect(browser.createIncognitoBrowserContext).toBeCalledTimes(2);
      expect(context.newPage).toBeCalledTimes(2);
    });

    each([
      [
        new puppeteer.errors.TimeoutError('Request timeout'),
        'https://example.com',
        RequestTimeoutError
      ],
      [
        new Error('net::ERR_INVALID_URL at invalidurl'),
        'chrome://invalid',
        InvalidUrlError
      ],
      [
        new Error('net::ERR_CERT_DATE_INVALID at https://expired.badssl.com'),
        'https://expired.badssl.com',
        SslCertificateError
      ],
      [
        new Error('net::ERR_SSL_VERSION_OR_CIPHER_MISMATCH at https://null.badssl.com'),
        'https://null.badssl.com',
        SslCertificateError
      ],
      [
        new Error('net::DNS_PROBE_FINISHED_NXDOMAIN at https://git.facebook.com'),
        'https://git.facebook.com',
        NotAvailableError
      ],
      [
        new Error('net::ERR_NAME_NOT_RESOLVED at https://one.example.com'),
        'https://one.example.com',
        NotAvailableError
      ],
      [
        new Error('net::ERR_CONNECTION_REFUSED at https://localhost:8080'),
        'https://localhost:8080',
        NotAvailableError
      ],
      [
        new Error('net::DNS_TIMED_OUT'),
        'https://example.com',
        NetworkError
      ]
    ]).test('should throw an Error %p', async (error: Error, urlString: string, expected: jest.Constructable) => {
      // Arrange
      page.goto.mockReturnValueOnce(Promise.reject(error));

      // Act
      const url = parse(urlString);
      const actual = dataSource.request(url);

      // Assert
      await expect(actual).rejects.toThrow(expected);
    });
  });

  describe('dispose', () => {
    const url = parse('https://example.com/');
    beforeEach(() => {
      page.goto.mockReturnValue(Promise.resolve(response));
    });

    test('should close page and disconnect browser', async () => {
      // Arrange
      browser.pages.mockReturnValue(Promise.resolve([page]));
      await dataSource.request(url);

      // Act
      await dataSource.dispose();

      // Assert
      expect(page.close).toBeCalledTimes(1);
      expect(browser.disconnect).toBeCalledTimes(1);
    });

    test('should close page and disconnect browser when browser throws an Error', async () => {
      // Arrange
      browser.pages.mockReturnValue(Promise.resolve([page]));
      browser.disconnect = jest.fn(() => {
        throw new Error('Failed to close browser');
      });
      await dataSource.request(url);

      // Act
      await dataSource.dispose();

      // Assert
      expect(page.close).toBeCalledTimes(1);
      expect(browser.disconnect).toBeCalledTimes(1);
    });

    test('should disconnect browser when page throws an Error', async () => {
      // Arrange
      page.close.mockImplementationOnce(() => {
        throw new Error('Failed to close page');
      });
      browser.pages.mockReturnValue(Promise.resolve([page]));
      await dataSource.request(url);

      // Act
      await dataSource.dispose();

      // Assert
      expect(page.close).toBeCalledTimes(1);
      expect(browser.disconnect).toBeCalledTimes(1);
    });

    test('should not close page and disconnect browser when browser is not set', async () => {
      // Act
      await dataSource.dispose();

      // Assert
      expect(page.close).not.toBeCalled();
      expect(browser.disconnect).not.toBeCalled();
    });
  });
});
