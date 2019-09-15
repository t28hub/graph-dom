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
import { BrowserService, OpenOptions, Options } from './browserService';
import { Logger } from '../util/logger/logger';
import { getLogger } from '../util/logger';

export class ChromeBrowserService implements BrowserService {
  private browser?: Browser;

  public constructor(
    private readonly options: Options,
    private readonly logger: Logger = getLogger(ChromeBrowserService.name)
  ) {}

  public async open(url: Url, options: Partial<OpenOptions> = {}): Promise<Document> {
    await this.ensureBrowser();
    try {
      const page = await this.goto(url, options);
      return await createDocument(page);
    } catch (e) {
      const formatted = format(url);
      this.logger.warn('Failed to open page: %s', formatted);
      throw new Error(`Failed to open page: ${formatted}`);
    }
  }

  public async dispose(): Promise<void> {
    if (this.browser === undefined) {
      return;
    }

    try {
      await this.browser.close();
    } catch (e) {
      this.logger.warn('Failed to close a browser: %s', e);
    }
    this.browser.disconnect();
  }

  protected async ensureBrowser(): Promise<Browser> {
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }

    const { browserPath, headless } = this.options;
    const options: LaunchOptions = {
      args: Chrome.args,
      defaultViewport: Chrome.defaultViewport,
      executablePath: browserPath,
      headless,
    };
    const browser = await Chrome.puppeteer.launch(options);
    this.browser = browser;
    return browser;
  }

  private async goto(url: Url, options: Partial<OpenOptions> = {}): Promise<Page> {
    if (this.browser === undefined) {
      throw Error('Valid browser instance is missing');
    }

    const page: Page = await this.browser.newPage();
    const { timeout, userAgent, waitUntil } = options;
    if (timeout !== undefined) {
      page.setDefaultTimeout(timeout);
    }
    if (userAgent !== undefined) {
      await page.setUserAgent(userAgent);
    }

    const navigationOptions: NavigationOptions = { waitUntil };
    const response: Response | null = await page.goto(format(url), navigationOptions);
    if (response === null) {
      throw new Error(`Could not receive response from ${format(url)}`);
    }

    const { status } = response;
    this.logger.info('Received response %d from %s', status, format(url));

    return page;
  }
}
