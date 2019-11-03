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

import { GraphQLModule, OnInit } from '@graphql-modules/core';
import { Inject, Injectable, ProviderScope } from '@graphql-modules/di';
import { ApolloError } from 'apollo-server-errors';
import { puppeteer } from 'chrome-aws-lambda';
import { Browser, BrowserOptions, ConnectOptions, LaunchOptions } from 'puppeteer-core';
import { PromiseOrValue } from 'graphql/jsutils/PromiseOrValue';

@Injectable({
  scope: ProviderScope.Application,
  overwrite: false,
})
export class BrowserProvider implements OnInit {
  private sharedBrowserPromise!: Promise<Browser>;

  public constructor(
    @Inject('BrowserPath') public readonly path: PromiseOrValue<string>,
    @Inject('BrowserHeadless') public readonly headless: boolean
  ) {}

  public async onInit(module: GraphQLModule): Promise<void> {
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
          '--mute-audio',
          '--no-default-browser-check',
          '--no-sandbox',
          '--single-process',
          this.headless ? '--headless' : '',
        ],
        headless: this.headless,
        executablePath: await this.path,
      };
      this.sharedBrowserPromise = puppeteer.launch(launchOptions);
    } catch (e) {
      throw new ApolloError(`Failed to initialize BrowserProvider because of failed to launch browser: ${e.message}`);
    }
  }

  public async connect(options: Partial<BrowserOptions> = {}): Promise<Browser> {
    try {
      const browser = await this.sharedBrowserPromise;
      const connectOptions: ConnectOptions = {
        browserWSEndpoint: browser.wsEndpoint(),
        ...options,
      };
      return await puppeteer.connect(connectOptions);
    } catch (e) {
      throw new ApolloError(`Failed to connect browser: ${e.message}`);
    }
  }

  public async dispose(): Promise<void> {
    const browser = await this.sharedBrowserPromise;
    await browser.close();
  }
}
