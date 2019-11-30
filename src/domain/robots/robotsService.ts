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
import { KeyValueCache, PrefixingKeyValueCache } from 'apollo-server-caching';
import { format, Url, UrlObject } from 'url';
import { RobotsTxtTranslator } from './translator/robotsTxtTranslator';
import { Logger } from '../../util/logging/logger';
import { LoggerFactory } from '../../util/logging/loggerFactory';
import { CacheProvider } from '../../infrastructure/cacheProvider';
import { Headers, TextFetcher } from '../../infrastructure/textFetcher';

const CACHE_KEY_PREFIX = 'robotstxt:';
const CACHE_TTL_MILLISECONDS = 1800000;
const FETCH_TIMEOUT_MILLISECONDS = 2000;

@Injectable({
  scope: ProviderScope.Application,
  overwrite: false,
})
export class RobotsService {
  private readonly cache: KeyValueCache;
  private readonly logger: Logger;

  public constructor(
    private readonly fetcher: TextFetcher,
    private readonly translator: RobotsTxtTranslator,
    cacheProvider: CacheProvider
  ) {
    this.cache = new PrefixingKeyValueCache<string>(cacheProvider.provideCache(), CACHE_KEY_PREFIX);
    this.logger = LoggerFactory.getLogger(RobotsService.name);
  }

  public async isAccessible(url: Url, userAgent?: string): Promise<boolean> {
    const robotsTxtUrl = RobotsService.buildRobotsTxtUrl(url);
    const fetched = await this.fetchText(robotsTxtUrl, FETCH_TIMEOUT_MILLISECONDS);
    const robotsTxt = this.translator.translate({ url: robotsTxtUrl, content: fetched });
    return robotsTxt.isAllowed(url, userAgent);
  }

  private async fetchText(url: UrlObject, timeout: number, headers: Headers = {}): Promise<string> {
    const urlString = format(url);
    const cached = await this.cache.get(urlString);
    if (cached) {
      this.logger.info('Retrieved cached text with key: Key=%s', urlString);
      return cached;
    }

    try {
      const fetched = await this.fetcher.fetch(url, timeout, headers);
      await this.cache.set(urlString, fetched, { ttl: CACHE_TTL_MILLISECONDS });
      return fetched;
    } catch (e) {
      this.logger.warn('Failed to fetch text from %s: %s', urlString, e.message);
      // Set negative cache when robots.txt does not exist
      await this.cache.set(urlString, '', { ttl: CACHE_TTL_MILLISECONDS });
      return '';
    }
  }

  private static buildRobotsTxtUrl(url: Url): UrlObject {
    const { protocol, host } = url;
    return { protocol, host, pathname: '/robots.txt' };
  }
}
