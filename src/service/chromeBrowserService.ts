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

import { Browser, LaunchOptions, NavigationOptions, Page, Response } from 'puppeteer';
import Chrome from 'chrome-aws-lambda';
import { format, Url } from 'url';
import { Document } from '../dom';
import { createDocument } from '../dom/puppeteer';
import { Optional } from '../util';
import { BrowserService, Options } from './browserService';
import { getLogger, Logger } from '../util/logging';

export class ChromeBrowserService implements BrowserService {
  public static async create(options: { path: string; headless: boolean }): Promise<ChromeBrowserService> {
    const defaultOptions: LaunchOptions = {
      args: Chrome.args,
      defaultViewport: Chrome.defaultViewport,
      executablePath: options.path,
      headless: options.headless,
    };
    const launchOptions: LaunchOptions = { ...defaultOptions, ...options };
    const browser: Browser = await Chrome.puppeteer.launch(launchOptions);
    return new ChromeBrowserService(browser);
  }

  private static readonly logger: Logger = getLogger(ChromeBrowserService.name);

  public constructor(private readonly browser: Browser) {}

  public async fetch(url: Url, options: Options = {}): Promise<Document> {
    const page: Page = await this.browser.newPage();
    const { timeout, userAgent } = options;
    if (timeout !== undefined) {
      page.setDefaultTimeout(timeout);
    }
    if (userAgent !== undefined) {
      await page.setUserAgent(userAgent);
    }

    const navigationOptions: NavigationOptions = { waitUntil: 'networkidle2' };
    const response: Response = Optional.ofNullable<Response>(
      await page.goto(format(url), navigationOptions)
    ).orElseThrow(() => new Error(`Received no response from ${url}`));

    const { status } = response;
    ChromeBrowserService.logger.info('Received %d from %s', status, format(url));
    return await createDocument(page);
  }

  public async close(): Promise<void> {
    const { logger } = ChromeBrowserService;
    const pages: Page[] = await this.browser.pages();
    for (const page of pages) {
      const url: string = page.url();
      try {
        await page.close();
      } catch (e) {
        logger.warn('Failed to close a page %s: %s', url, e);
      }
    }

    try {
      await this.browser.close();
    } catch (e) {
      logger.warn('Failed to close a browser: %s', e);
    }
    this.browser.disconnect();
  }
}
