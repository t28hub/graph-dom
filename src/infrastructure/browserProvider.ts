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
import Chrome from 'chrome-aws-lambda';
import { Browser, BrowserOptions, ConnectOptions } from 'puppeteer';

export interface Config {
  readonly path: string;
  readonly headless: boolean;
}

@Injectable({
  scope: ProviderScope.Application,
  overwrite: false,
})
export class BrowserProvider implements OnInit {
  private rootBrowserPromise!: Promise<Browser>;

  public constructor(
    @Inject('BrowserPath') public readonly path: string,
    @Inject('BrowserHeadless') public readonly headless: boolean
  ) {}

  public onInit(module: GraphQLModule): void {
    this.rootBrowserPromise = Chrome.puppeteer.launch({
      executablePath: this.path,
      headless: this.headless,
    });
  }

  public async provideBrowser(options: Partial<BrowserOptions> = {}): Promise<Browser> {
    const browser = await this.rootBrowserPromise;
    const connectOptions: ConnectOptions = {
      browserWSEndpoint: browser.wsEndpoint(),
      ...options,
    };
    return await Chrome.puppeteer.connect(connectOptions);
  }
}
