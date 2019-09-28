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

import Chrome from 'chrome-aws-lambda';
import { Browser, LaunchOptions, NavigationOptions, Page, Request, ResourceType, Response } from 'puppeteer';
import { format, Url } from 'url';
import { Document } from '../dom';
import { createDocument } from '../dom/puppeteer';
import { BrowserService, Options } from './browserService';
import { getLogger, Logger } from '../util/logging';
import { ApolloError } from 'apollo-server-errors';
import { RequestTimeoutError } from './errors/requestTimeoutError';
import { SslCertificateError } from './errors/sslCertificateError';
import { NoResponseError } from './errors/noResponseError';
import { NotAvailableError } from './errors/notAvailableError';
import { NetworkError } from './errors/networkError';
import { InvalidUrlError } from './errors/invalidUrlError';

export interface BrowserOptions {
  readonly path: string;
  readonly headless: boolean;
}

const DEFAULT_TIMEOUT = 50000;
const DEFAULT_NAVIGATION_TIMEOUT = 50000;
const STATUS_CODE_OK = 200;
const STATUS_CODE_MULTIPLE_CHOICE = 300;
const IGNORED_RESOURCE_TYPES: ResourceType[] = ['font', 'image', 'media', 'stylesheet'];

export class ChromeBrowserService implements BrowserService {
  private static readonly logger: Logger = getLogger(ChromeBrowserService.name);

  // Avoid to instantiate multiple browsers.
  private browserPromise?: Promise<Browser>;

  public constructor(private readonly browserOptions: BrowserOptions) {}

  public async open(url: Url, options: Partial<Options> = {}): Promise<Document> {
    const { logger } = ChromeBrowserService;
    const browser = await this.ensureBrowser();
    const page = await browser.newPage();
    page.setDefaultTimeout(DEFAULT_TIMEOUT);
    page.setDefaultNavigationTimeout(DEFAULT_NAVIGATION_TIMEOUT);

    if (this.browserOptions.headless) {
      await page.setRequestInterception(true);
      page.on('request', (request: Request) => {
        if (IGNORED_RESOURCE_TYPES.includes(request.resourceType())) {
          request.abort('aborted');
        } else {
          request.continue();
        }
      });
    }

    const urlString = format(url);
    try {
      const response: Response = await ChromeBrowserService.goto(page, urlString, options);
      const status = response.status();
      if (status >= STATUS_CODE_OK && status < STATUS_CODE_MULTIPLE_CHOICE) {
        logger.info("Received successful status '%d' from %s", status, urlString);
      } else {
        logger.warn("Received non-successful status '%d' from %s", status, urlString);
      }
      return await createDocument(page);
    } catch (e) {
      await ChromeBrowserService.closePage(page);

      logger.warn('Failed to navigate to %s: %s', urlString, e.message);
      throw ChromeBrowserService.translateError(e, urlString);
    }
  }

  public async dispose(): Promise<void> {
    const { logger } = ChromeBrowserService;
    if (this.browserPromise === undefined) {
      return;
    }

    const browser = await this.browserPromise;
    const pages: Page[] = await browser.pages();
    await Promise.all(pages.map((page: Page) => ChromeBrowserService.closePage(page)));

    try {
      await browser.close();
      logger.info('Browser is closed');
    } catch (e) {
      logger.warn('Failed to close a browser: %s', e.message);
    } finally {
      browser.disconnect();
      this.browserPromise = undefined;
    }
  }

  private ensureBrowser(): Promise<Browser> {
    if (this.browserPromise) {
      return this.browserPromise;
    }

    const { path: executablePath, headless } = this.browserOptions;
    ChromeBrowserService.logger.warn('Launch options %s', Chrome.args);
    const options: LaunchOptions = {
      args: Chrome.args,
      defaultViewport: Chrome.defaultViewport,
      executablePath,
      headless,
    };
    const browserPromise = Chrome.puppeteer.launch(options);
    this.browserPromise = browserPromise;
    return browserPromise;
  }

  private static async goto(page: Page, urlString: string, options: Partial<Options>): Promise<Response> {
    const { timeout, userAgent, waitUntil } = options;
    if (timeout !== undefined) {
      page.setDefaultTimeout(timeout);
    }
    if (userAgent !== undefined) {
      await page.setUserAgent(userAgent);
    }

    // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagegotourl-options
    const navigationOptions: NavigationOptions = { waitUntil: waitUntil || 'load' };
    const response: Response | null = await page.goto(urlString, navigationOptions);
    if (response === null) {
      throw new NoResponseError(`Received no response from ${urlString}`);
    }
    return response;
  }

  private static async closePage(page: Page): Promise<void> {
    const { logger } = ChromeBrowserService;
    const url: string = page.url();
    try {
      await page.close();
    } catch (e) {
      logger.warn('Failed to close a page(%s): %s', url, e.message);
    }
  }

  private static translateError(error: Error, urlString: string): ApolloError {
    if (error instanceof ApolloError) {
      return error;
    }

    if (error instanceof Chrome.puppeteer.errors.TimeoutError) {
      return new RequestTimeoutError(`Request timed out ${urlString}`);
    }

    // Puppeteer throws an error when network error occurred.
    // Cannot detect error using 'instanceof' operator because thrown error is instance of Error.
    // The error message contains an error code defined in chromium.
    // https://cs.chromium.org/chromium/src/net/base/net_error_list.h
    const { message } = error;
    if (/ERR_INVALID_URL/.test(message)) {
      return new InvalidUrlError(`URL is invalid ${urlString}`);
    }
    // https://support.google.com/chrome/answer/6098869?hl=en
    if (/ERR_CERT_/.test(message) || /ERR_SSL_/.test(message)) {
      return new SslCertificateError(`Received SSL certificate error from ${urlString}`);
    }
    // https://support.google.com/chromebook/answer/1085581?hl=en
    if (
      /DNS_PROBE_FINISHED_NXDOMAIN/.test(message) ||
      /ERR_NAME_NOT_RESOLVED/.test(message) ||
      /ERR_CONNECTION_REFUSED/.test(message)
    ) {
      return new NotAvailableError(`Requested webpage is not available ${urlString}`);
    }
    return new NetworkError(`Received network error from ${urlString}`);
  }
}
