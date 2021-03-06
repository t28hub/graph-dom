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

import { DataSource } from 'apollo-datasource';
import { ApolloError } from 'apollo-server-errors';
import Chrome from 'chrome-aws-lambda';
import { PromiseOrValue } from 'graphql/jsutils/PromiseOrValue';
import {
  AuthOptions,
  Browser,
  BrowserOptions,
  GeoOptions,
  LoadEvent as LoadEventString,
  NavigationOptions,
  Page,
  Request,
  Response,
  SameSiteSetting as SameSiteOptions,
  SetCookie,
  Viewport,
} from 'puppeteer';
import { format, Url } from 'url';
import {
  InvalidUrlError,
  NetworkError,
  NoResponseError,
  NotAvailableError,
  RequestTimeoutError,
  SslCertificateError,
} from './errors';
import { BrowserProvider } from '../infrastructure/browserProvider';
import { Logger } from '../util/logging/logger';

// https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagegotourl-options
export enum LoadEvent {
  LOAD = 'load', // Wait until 'load' event is fired.
  NETWORK_IDLE0 = 'networkidle0', // Wait until network connections are no more than 0.
  NETWORK_IDLE2 = 'networkidle2', // Wait until network connections are no more than 2.
  DOM_CONTENT_LOADED = 'domcontentloaded', // Wait until 'DOMContentLoaded' event is fired.
}

export interface Headers {
  [name: string]: string;
}

export type AuthSetting = AuthOptions;
export type CookieSetting = SetCookie;
export type GeoSetting = GeoOptions;
export type SameSiteSetting = SameSiteOptions;
export type ViewportSetting = Viewport;

export interface Options {
  readonly cookies?: CookieSetting[];
  readonly headers?: Headers;
  readonly viewport?: ViewportSetting;
  readonly userAgent?: string;
  readonly geolocation?: GeoSetting;
  readonly credentials?: AuthOptions;
  readonly javaScriptEnabled?: boolean;
  readonly ignoreRobotsTxt?: boolean;
}

const DEFAULT_TIMEOUT = 10000;

/* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
export abstract class BrowserDataSource<TContext = any, R = any> extends DataSource {
  protected get headless(): boolean {
    return this.browserProvider.headless;
  }

  // Avoid to instantiate multiple browsers.
  private browserPromise?: Promise<Browser>;

  protected constructor(private readonly browserProvider: BrowserProvider, protected readonly logger: Logger) {
    super();
  }

  public async request(
    url: Url,
    timeout: number = DEFAULT_TIMEOUT,
    waitFor: LoadEvent = LoadEvent.LOAD,
    options: Options = {}
  ): Promise<R> {
    const page = await this.ensurePage(options);
    await this.willSendRequest(url, waitFor, options);
    const urlString = format(url);
    try {
      // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagegotourl-options
      const navigationOptions: NavigationOptions = { timeout, waitUntil: waitFor as LoadEventString };
      const response = await page.goto(urlString, navigationOptions);
      if (response === null) {
        // noinspection ExceptionCaughtLocallyJS
        throw new NoResponseError(`Received no response from ${urlString}`);
      }
      return await this.didReceiveResponse(page, response);
    } catch (e) {
      await this.closePage(page);
      return this.didReceiveError(e, url, options);
    }
  }

  public async dispose(): Promise<void> {
    if (this.browserPromise === undefined) {
      this.logger.debug('Browser is missing');
      return;
    }

    const browser = await this.browserPromise;
    try {
      const pages: Page[] = await browser.pages();
      await Promise.all(pages.map(this.closePage));
    } catch (e) {
      this.logger.warn('Failed to close pages: %s', e.message);
    }

    try {
      await this.browserProvider.dispose(browser);
      this.logger.info('Browser is disposed');
    } catch (e) {
      this.logger.warn('Failed to dispose a browser: %s', e.message);
    } finally {
      this.browserPromise = undefined;
    }
  }

  protected abstract willSendRequest(url: Url, waitUntil: LoadEvent, options: Options): PromiseOrValue<void>;

  protected abstract didReceiveResponse(page: Page, response: Response): PromiseOrValue<R>;

  protected didReceiveError(error: Error, url: Url, _options: Options): never {
    if (error instanceof ApolloError) {
      throw error;
    }

    const urlString = format(url);
    if (error instanceof Chrome.puppeteer.errors.TimeoutError) {
      throw new RequestTimeoutError(`Request timed out ${urlString}`);
    }

    // Puppeteer throws an error when network error occurred.
    // Cannot detect error using 'instanceof' operator because thrown error is instance of Error.
    // The error message contains an error code defined in chromium.
    // https://cs.chromium.org/chromium/src/net/base/net_error_list.h
    const { message } = error;
    if (/ERR_INVALID_URL/.test(message)) {
      throw new InvalidUrlError(`URL is invalid ${urlString}`);
    }
    // https://support.google.com/chrome/answer/6098869?hl=en
    if (/ERR_CERT_/.test(message) || /ERR_SSL_/.test(message)) {
      throw new SslCertificateError(`Received SSL certificate error from ${urlString}`);
    }
    // https://support.google.com/chromebook/answer/1085581?hl=en
    if (
      /DNS_PROBE_FINISHED_NXDOMAIN/.test(message) ||
      /ERR_NAME_NOT_RESOLVED/.test(message) ||
      /ERR_CONNECTION_REFUSED/.test(message)
    ) {
      throw new NotAvailableError(`Requested webpage is not available ${urlString}`);
    }
    throw new NetworkError(`Received unknown network error from ${urlString}`);
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  protected interceptRequest(request: Request, ...args: any[]): PromiseOrValue<void> {
    // noinspection JSIgnoredPromiseFromCall
    request.continue();
    this.logger.debug('Sending request %s as %s', request.url(), request.resourceType());
  }

  private ensureBrowser(): Promise<Browser> {
    if (this.browserPromise) {
      return this.browserPromise;
    }

    const options: BrowserOptions = { defaultViewport: Chrome.defaultViewport };
    const provided = this.browserProvider.provide(options);
    this.browserPromise = provided;
    return provided;
  }

  private async ensurePage(options: Options): Promise<Page> {
    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    const promises: Promise<void>[] = [];
    if (options.cookies) {
      promises.push(page.setCookie(...options.cookies));
    }
    if (options.headers) {
      promises.push(page.setExtraHTTPHeaders(options.headers));
    }
    if (options.viewport) {
      promises.push(page.setViewport(options.viewport));
    }
    if (options.userAgent) {
      promises.push(page.setUserAgent(options.userAgent));
    }
    if (options.geolocation) {
      promises.push(page.setGeolocation(options.geolocation));
    }
    if (options.credentials) {
      promises.push(page.authenticate(options.credentials));
    }
    if (options.javaScriptEnabled !== undefined) {
      promises.push(page.setJavaScriptEnabled(options.javaScriptEnabled));
    }
    promises.push(page.setRequestInterception(true));
    page.on('request', this.interceptRequest);

    // Make async functions faster by using Promise.all
    // https://v8.dev/blog/fast-async
    await Promise.all(promises);
    return page;
  }

  private async closePage(page: Page): Promise<void> {
    try {
      await page.close();
    } catch (e) {
      this.logger.warn('Failed to close a page(%s): %s', page.url(), e.message);
    }
  }
}
