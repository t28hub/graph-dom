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

import each from 'jest-each';
import { parse } from 'url';
import puppeteer, { browser, page } from '../../src/__mocks__/puppeteer';
import { ChromeBrowserService } from '../../src/service/chromeBrowserService';
import { InvalidUrlError } from '../../src/service/errors/invalidUrlError';
import { RequestTimeoutError } from '../../src/service/errors/requestTimeoutError';
import { NoResponseError } from '../../src/service/errors/noResponseError';
import { SslCertificateError } from '../../src/service/errors/sslCertificateError';
import { NotAvailableError } from '../../src/service/errors/notAvailableError';
import { NetworkError } from '../../src/service/errors/networkError';

jest.mock('chrome-aws-lambda', () => {
  return { args: [], puppeteer };
});
jest.mock('../../src/dom/puppeteer');
jest.mock('../../src/util/logging');

describe('ChromeBrowserService', () => {
  let browserService!: ChromeBrowserService;
  beforeEach(() => {
    jest.clearAllMocks();

    page.goto.mockReturnValue(Promise.resolve({
      status: jest.fn().mockReturnValue(200)
    }));
    browser.newPage.mockReturnValue(Promise.resolve(page));
    puppeteer.launch.mockReturnValue(browser);
    browserService = new ChromeBrowserService({
      path: '/path/to/chrome',
      headless: true
    });
  });

  describe('open', () => {
    test('should launch browser', async () => {
      // Arrange
      page.goto.mockReturnValueOnce(Promise.resolve({
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
      page.goto.mockReturnValueOnce(Promise.resolve({
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

    test('should set request interceptor when headless is true', async () => {
      // Act
      const browserService = new ChromeBrowserService({
        path: '/path/to/chrome',
        headless: true
      });

      // Act
      const url = parse('https://example.com/');
      await browserService.open(url);

      // Assert
      expect(page.setRequestInterception).toBeCalledWith(true);
      expect(page.on).toBeCalledWith('request', expect.any(Function));
    });

    each([
      ['font'],
      ['image'],
      ['media'],
      ['stylesheet']
    ]).test('should abort request when resource type is blocking: %s', async (resourceType: string) => {
      // Act
      const browserService = new ChromeBrowserService({
        path: '/path/to/chrome',
        headless: true
      });
      const request = {
        abort: jest.fn(),
        continue: jest.fn(),
        resourceType: jest.fn().mockReturnValue(resourceType)
      };
      page.on.mockImplementation((eventName: string, handler: (request: any) => void) => {
        if (eventName === 'request') {
          handler(request);
        }
      });

      // Act
      const url = parse('https://example.com/');
      await browserService.open(url);

      // Assert
      expect(request.abort).toBeCalledWith('aborted');
      expect(request.continue).not.toBeCalled();
    });

    each([
      ['document'],
      ['script'],
      ['texttrack'],
      ['xhr'],
      ['fetch'],
      ['eventsource'],
      ['websocket'],
      ['manifest'],
      ['other'],
      ['unknown']
    ]).test('should continue request when resource type is not blocking: %s', async (resourceType: string) => {
      // Act
      const browserService = new ChromeBrowserService({
        path: '/path/to/chrome',
        headless: true
      });
      const request = {
        abort: jest.fn(),
        continue: jest.fn(),
        resourceType: jest.fn().mockReturnValue(resourceType)
      };
      page.on.mockImplementation((eventName: string, handler: (request: any) => void) => {
        if (eventName === 'request') {
          handler(request);
        }
      });

      // Act
      const url = parse('https://example.com/');
      await browserService.open(url);

      // Assert
      expect(request.abort).not.toBeCalled();
      expect(request.continue).toBeCalled();
    });

    test('should not set request interceptor when headless is true', async () => {
      // Act
      const browserService = new ChromeBrowserService({
        path: '/path/to/chrome',
        headless: false
      });

      // Act
      const url = parse('https://example.com/');
      await browserService.open(url);

      // Assert
      expect(page.setRequestInterception).not.toBeCalled();
      expect(page.on).not.toBeCalled();
    });

    test('should set default timeout when property is set', async () => {
      // Act
      const url = parse('https://example.com/');
      await browserService.open(url, { timeout: 5000 });

      // Assert
      expect(browser.newPage).toBeCalledWith();
      expect(page.setDefaultTimeout).toBeCalledWith(5000);
    });

    test('should set userAgent when property is set', async () => {
      // Act
      const url = parse('https://example.com/');
      await browserService.open(url, { userAgent: 'CustomUserAgent/1.0.0' });

      // Assert
      expect(browser.newPage).toBeCalledWith();
      expect(page.setUserAgent).toBeCalledWith('CustomUserAgent/1.0.0');
    });

    test('should set waitUntil when property is set', async () => {
      // Act
      const url = parse('https://example.com/');
      await browserService.open(url, { waitUntil: 'networkidle2' });

      // Assert
      expect(browser.newPage).toBeCalledWith();
      expect(page.goto).toBeCalledWith('https://example.com/', { waitUntil: 'networkidle2' });
    });

    test('should throw an Error when received response is null', async () => {
      // Arrange
      page.goto.mockReturnValueOnce(Promise.resolve(null));

      // Act
      const url = parse('https://example.com/');
      const actual = browserService.open(url);

      // Assert
      await expect(actual).rejects.toThrow(NoResponseError);
    });

    test('should not throw an Error when received status is not successful', async () => {
      // Arrange
      page.goto.mockReturnValueOnce(Promise.resolve({
        status: jest.fn().mockReturnValue(404)
      }));

      // Act
      const url = parse('https://example.com/');
      const actual = await browserService.open(url);

      // Assert
      await expect(actual).toBeUndefined();
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
    ]).test('should throw an Error when error %p', async (error: Error, urlString: string, expected: jest.Constructable) => {
      // Arrange
      page.goto.mockReturnValueOnce(Promise.reject(error));

      // Act
      const url = parse(urlString);
      const actual = browserService.open(url);

      // Assert
      await expect(actual).rejects.toThrow(expected);
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
      page.close.mockImplementationOnce(() => {
        throw new Error('Failed to close page');
      });
      browser.pages.mockReturnValue(Promise.resolve([page]));

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
