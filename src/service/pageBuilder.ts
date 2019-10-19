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

import { Browser, Page, Request } from 'puppeteer';

const DEFAULT_TIMEOUT = 50000;
const DEFAULT_NAVIGATION_TIMEOUT = 50000;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PageBuilder {
  private readonly options: {
    userAgent?: string;
    timeout?: number;
    navigationTimeout?: number;
    javaScriptEnabled?: boolean;
    requestInterceptor?: (request: Request, ...args: any[]) => void;
  } = {};

  public static builder(browser: Browser): PageBuilder {
    return new PageBuilder(browser);
  }

  private constructor(private readonly browser: Browser) {}

  public setUserAgent(userAgent?: string): this {
    this.options.userAgent = userAgent;
    return this;
  }

  public setTimeout(timeout?: number): this {
    this.options.timeout = timeout;
    return this;
  }

  public setNavigationTimeout(timeout?: number): this {
    this.options.navigationTimeout = timeout;
    return this;
  }

  public setRequestInterceptor(interceptor?: (request: Request, ...args: any[]) => void): this {
    this.options.requestInterceptor = interceptor;
    return this;
  }

  public setJavaScriptEnabled(enabled?: boolean): this {
    this.options.javaScriptEnabled = enabled;
    return this;
  }

  public async build(): Promise<Page> {
    const { browser, options } = this;
    const page = await browser.newPage();
    page.setDefaultTimeout(options.timeout || DEFAULT_TIMEOUT);
    page.setDefaultNavigationTimeout(options.navigationTimeout || DEFAULT_NAVIGATION_TIMEOUT);
    await page.setUserAgent(options.userAgent || (await browser.userAgent()));
    await page.setJavaScriptEnabled(options.javaScriptEnabled !== undefined ? options.javaScriptEnabled : true);
    if (options.requestInterceptor) {
      await page.setRequestInterception(true);
      page.on('request', options.requestInterceptor);
    }
    return page;
  }
}
