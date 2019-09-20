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

import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { format, Url } from 'url';
import { Context } from '../context';
import { Document } from '../../dom';
import { BrowserService, WaitUntil } from '../../service/browserService';
import { RobotsTxtFetcher } from '../../service/robotsTxtFetcher';
import { getLogger, Logger } from '../../util/logging';

export interface Options {
  readonly timeout: number;
  readonly userAgent: string;
  readonly waitUntil: WaitUntil;
}

export class BrowserDataSource extends DataSource<Context> {
  private static readonly logger: Logger = getLogger(BrowserDataSource.name);

  private browserService!: BrowserService;
  private robotsTxtFetcher!: RobotsTxtFetcher;

  public constructor() {
    super();
  }

  public initialize(config: DataSourceConfig<Context>): void {
    const { logger } = BrowserDataSource;
    logger.debug('Initializing BrowserDataSource');

    const { axios, browser } = config.context;
    this.browserService = browser;
    this.robotsTxtFetcher = new RobotsTxtFetcher(axios);

    logger.debug('Initialized BrowserDataSource');
  }

  public async fetch(url: Url, options: Partial<Options> = {}): Promise<Document> {
    const robotsTxt = await this.robotsTxtFetcher.fetch(url);
    if (!robotsTxt.isAllowed(url, options.userAgent)) {
      throw new Error(`URL is not allowed to fetch by robots.txt: ${format(url)}`);
    }
    return await this.browserService.open(url, options);
  }
}
