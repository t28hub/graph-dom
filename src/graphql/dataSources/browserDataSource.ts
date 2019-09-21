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
import { RobotsTxtCache } from '../../service/robotsTxtCache';
import { RobotsTxt } from '../../service/robotsTxt';
import { PrefixingKeyValueCache } from 'apollo-server-caching';

export interface Options {
  readonly timeout: number;
  readonly userAgent: string;
  readonly waitUntil: WaitUntil;
}

const ROBOTS_TXT_CACHE_JEY_PREFIX = 'robotstxt:';

export class BrowserDataSource extends DataSource<Context> {
  private static readonly logger: Logger = getLogger(BrowserDataSource.name);

  private browserService!: BrowserService;
  private robotsTxtCache!: RobotsTxtCache;
  private robotsTxtFetcher!: RobotsTxtFetcher;

  public constructor() {
    super();
  }

  public initialize(config: DataSourceConfig<Context>): void {
    const { logger } = BrowserDataSource;
    logger.debug('Initializing BrowserDataSource');

    const { axios, browser } = config.context;
    this.browserService = browser;
    this.robotsTxtCache = new RobotsTxtCache(new PrefixingKeyValueCache(config.cache, ROBOTS_TXT_CACHE_JEY_PREFIX));
    this.robotsTxtFetcher = new RobotsTxtFetcher(axios);

    logger.debug('Initialized BrowserDataSource');
  }

  public async fetch(url: Url, options: Partial<Options> = {}): Promise<Document> {
    const robotsTxt = await this.getRobotsTxt(url);
    if (!robotsTxt.isAllowed(url, options.userAgent)) {
      throw new Error(`URL is not allowed to fetch by robots.txt: ${format(url)}`);
    }
    return await this.browserService.open(url, options);
  }

  private async getRobotsTxt(url: Url): Promise<RobotsTxt> {
    const { logger } = BrowserDataSource;
    const urlString = format(url);
    logger.info('Getting robots.txt from %s', urlString);

    const robotsTxtUrl = RobotsTxtFetcher.buildRobotsTxtUrl(url);
    const cached = (await this.robotsTxtCache.get(robotsTxtUrl)).orElse(null);
    if (cached) {
      logger.info('Received cached robots.txt for %s', urlString);
      return cached;
    }

    const robotsTxt = await this.robotsTxtFetcher.fetch(url);
    logger.info('Received fetched robots.txt for %s', urlString);
    await this.robotsTxtCache.set(robotsTxtUrl, robotsTxt);
    return robotsTxt;
  }
}
