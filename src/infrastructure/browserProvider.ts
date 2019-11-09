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

import { Inject, Injectable, ProviderScope } from '@graphql-modules/di';
import { ApolloError } from 'apollo-server-errors';
import { puppeteer } from 'chrome-aws-lambda';
import { Browser, BrowserOptions, LaunchOptions } from 'puppeteer-core';
import { PromiseOrValue } from 'graphql/jsutils/PromiseOrValue';

@Injectable({
  scope: ProviderScope.Application,
  overwrite: false,
})
export class BrowserProvider {
  public constructor(
    @Inject('BrowserPath') public readonly path: PromiseOrValue<string>,
    @Inject('BrowserHeadless') public readonly headless: boolean
  ) {}

  public async provide(options: Partial<BrowserOptions> = {}): Promise<Browser> {
    try {
      const launchOptions: LaunchOptions = {
        args: [
          '--disable-extensions',
          '--disable-gpu',
          '--disable-infobars',
          '--disable-notifications',
          '--disable-setuid-sandbox',
          '--disable-speech-api',
          '--disable-voice-input',
          '--hide-scrollbars',
          '--incognito',
          '--mute-audio',
          '--no-default-browser-check',
          '--no-sandbox',
          '--single-process',
          this.headless ? '--headless' : '',
        ],
        headless: this.headless,
        executablePath: await this.path,
        ...options,
      };
      return await puppeteer.launch(launchOptions);
    } catch (e) {
      throw new ApolloError(`Failed to initialize BrowserProvider because of failed to launch browser: ${e.message}`);
    }
  }

  public async dispose(browser: Browser): Promise<void> {
    try {
      if (browser.isConnected()) {
        browser.disconnect();
      }
    } catch (e) {
      throw new ApolloError(`Failed to disconnect browser: ${e.message}`);
    }

    try {
      await browser.close();
    } catch (e) {
      throw new ApolloError(`Failed to close browser: ${e.message}`);
    }
  }
}
