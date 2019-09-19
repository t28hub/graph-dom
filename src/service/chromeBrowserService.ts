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
import { Browser, LaunchOptions, NavigationOptions, Page, Response } from 'puppeteer';
import { format, Url } from 'url';
import { Document } from '../dom';
import { createDocument } from '../dom/puppeteer';
import { BrowserService, Options } from './browserService';
import { getLogger, Logger } from '../util/logging';

export interface BrowserOptions {
  readonly path: string;
  readonly headless: boolean;
}

const DEFAULT_TIMEOUT = 50000;
const DEFAULT_NAVIGATION_TIMEOUT = 50000;
const STATUS_CODE_OK = 200;
const STATUS_CODE_MULTIPLE_CHOICE = 300;

export class ChromeBrowserService implements BrowserService {
  private static readonly logger: Logger = getLogger(ChromeBrowserService.name);

  private browser?: Browser;

  public constructor(private readonly browserOptions: BrowserOptions) {}

  public async open(url: Url, options: Partial<Options> = {}): Promise<Document> {
    const { logger } = ChromeBrowserService;
    const browser = await this.ensureBrowser();
    const page: Page = await browser.newPage();
    page.setDefaultTimeout(DEFAULT_TIMEOUT);
    page.setDefaultNavigationTimeout(DEFAULT_NAVIGATION_TIMEOUT);
    try {
      const urlString = format(url);
      const response: Response = await ChromeBrowserService.goto(page, urlString, options);
      const [status, statusText] = [response.status(), response.statusText()];
      if (status >= STATUS_CODE_OK || status < STATUS_CODE_MULTIPLE_CHOICE) {
        logger.info('Received successful status %d %s from %s', status, statusText, urlString);
      } else {
        logger.warn('Received non-successful status %d %s from %s', status, response.statusText(), urlString);
      }
      return await createDocument(page);
    } catch (e) {
      await ChromeBrowserService.closePage(page);
      throw e;
    }
  }

  public async close(): Promise<void> {
    const { logger } = ChromeBrowserService;
    if (this.browser === undefined) {
      logger.info('Browser is not defined');
      return;
    }

    const pages: Page[] = await this.browser.pages();
    await Promise.all(pages.map((page: Page) => ChromeBrowserService.closePage(page)));

    try {
      await this.browser.close();
      logger.info('Browser ia closed');
    } catch (e) {
      logger.warn('Failed to close a browser: %s', e.message);
    } finally {
      this.browser.disconnect();
      this.browser = undefined;
    }
  }

  private async ensureBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    const { path: executablePath, headless } = this.browserOptions;
    const options: LaunchOptions = {
      args: Chrome.args,
      defaultViewport: Chrome.defaultViewport,
      executablePath,
      headless,
    };
    const browser: Browser = await Chrome.puppeteer.launch(options);
    this.browser = browser;
    return browser;
  }

  private static async goto(page: Page, urlString: string, options: Partial<Options>): Promise<Response> {
    const { timeout, userAgent, waitUntil } = options;
    if (timeout !== undefined) {
      page.setDefaultTimeout(timeout);
    }
    if (userAgent !== undefined) {
      await page.setUserAgent(userAgent);
    }

    const navigationOptions: NavigationOptions = { waitUntil: waitUntil || 'load' };
    const response: Response | null = await page.goto(urlString, navigationOptions);
    if (response === null) {
      throw new Error(`Received no response from ${urlString}`);
    }
    return response;
  }

  private static async closePage(page: Page): Promise<void> {
    const url: string = page.url();
    try {
      await page.close();
    } catch (e) {
      ChromeBrowserService.logger.warn('Failed to close a page(%s): %s', url, e.message);
    }
  }
}
