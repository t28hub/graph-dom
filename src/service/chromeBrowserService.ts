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
import { Document, PuppeteerDocument } from '../dom';
import { Optional } from '../util';
import { BrowserService, Options } from './browserService';
import { Logger } from '../util/logger/logger';
import { getLogger } from '../util/logger';

export class ChromeBrowserService implements BrowserService {
  /* eslint-disable-next-line */
  public static async create(options: { [name: string]: any } = {}): Promise<ChromeBrowserService> {
    // TODO: Remove temporary implementation
    const browserPath =
      process.env.NODE_ENV === 'development'
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : await Chrome.executablePath;
    const defaultOptions: LaunchOptions = {
      args: Chrome.args,
      defaultViewport: Chrome.defaultViewport,
      executablePath: browserPath,
      headless: Chrome.headless,
    };
    const launchOptions: LaunchOptions = { ...defaultOptions, ...options };
    const browser: Browser = await Chrome.puppeteer.launch(launchOptions);
    return new ChromeBrowserService(browser);
  }

  public constructor(
    private readonly browser: Browser,
    private readonly logger: Logger = getLogger(ChromeBrowserService.name)
  ) {}

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
    this.logger.info('Received %d from %s', status, format(url));
    return PuppeteerDocument.create(page);
  }

  public async close(): Promise<void> {
    const pages: Page[] = await this.browser.pages();
    for (const page of pages) {
      const url: string = page.url();
      try {
        await page.close();
      } catch (e) {
        this.logger.warn('Failed to close a page %s: %s', url, e);
      }
    }

    try {
      await this.browser.close();
    } catch (e) {
      this.logger.warn('Failed to close a browser: %s', e);
    }
    this.browser.disconnect();
  }
}