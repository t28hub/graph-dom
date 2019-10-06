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

import { Injectable, ProviderScope } from '@graphql-modules/di';
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { PrefixingKeyValueCache } from 'apollo-server-caching';
import { format, Url } from 'url';
import { Context } from '../../context';
import { Document } from '../../dom';
import { LoggerProvider } from '../../infrastructure/loggerProvider';
import { WaitUntil } from '../../service/browserService';
import { ChromeBrowserService } from '../../service/chromeBrowserService';
import { RobotsTxt } from '../../service/robotsTxt';
import { RobotsTxtCache } from '../../service/robotsTxtCache';
import { RobotsTxtFetcher } from '../../service/robotsTxtFetcher';
import { Logger } from '../../util/logging/logger';

export interface Options {
  readonly timeout: number;
  readonly userAgent: string;
  readonly waitUntil: WaitUntil;
}

const ROBOTS_TXT_CACHE_KEY_PREFIX = 'robotstxt:';

@Injectable({
  scope: ProviderScope.Session,
})
export class BrowserDataSource extends DataSource<Context> {
  private readonly logger: Logger;

  private robotsTxtCache!: RobotsTxtCache;

  public constructor(
    private readonly browserService: ChromeBrowserService,
    private readonly robotsTxtFetcher: RobotsTxtFetcher,
    loggerProvider: LoggerProvider
  ) {
    super();
    this.logger = loggerProvider.provideLogger(BrowserDataSource.name);
  }

  public initialize(config: DataSourceConfig<Context>): void {
    const { cache } = config;
    this.robotsTxtCache = new RobotsTxtCache(new PrefixingKeyValueCache(cache, ROBOTS_TXT_CACHE_KEY_PREFIX));
    this.logger.debug('Initialized BrowserDataSource');
  }

  public async fetch(url: Url, options: Partial<Options> = {}): Promise<Document> {
    const robotsTxt = await this.getRobotsTxt(url);
    if (!robotsTxt.isAllowed(url, options.userAgent)) {
      throw new Error(`URL is not allowed to fetch by robots.txt: ${format(url)}`);
    }
    return await this.browserService.open(url, options);
  }

  private async getRobotsTxt(url: Url): Promise<RobotsTxt> {
    const urlString = format(url);
    this.logger.info('Getting robots.txt from %s', urlString);

    const robotsTxtUrl = RobotsTxtFetcher.buildRobotsTxtUrl(url);
    const cached = (await this.robotsTxtCache.get(robotsTxtUrl)).orElse(null);
    if (cached) {
      this.logger.info('Received cached robots.txt for %s', urlString);
      return cached;
    }

    const robotsTxt = await this.robotsTxtFetcher.fetch(url);
    this.logger.info('Received fetched robots.txt for %s', urlString);
    await this.robotsTxtCache.set(robotsTxtUrl, robotsTxt);
    return robotsTxt;
  }
}
