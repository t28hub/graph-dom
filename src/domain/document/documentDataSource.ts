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

import { OnResponse } from '@graphql-modules/core';
import { Injectable, ProviderScope } from '@graphql-modules/di';
import { DataSourceConfig } from 'apollo-datasource';
import { PrefixingKeyValueCache } from 'apollo-server-caching';
import { Page, Request, ResourceType, Response } from 'puppeteer';
import { format, Url } from 'url';
import { create } from '.';
import { Document } from '..';
import { BrowserDataSource, Options, LoadEvent } from '../browserDataSource';
import { Context } from '../../context';
import { BrowserProvider } from '../../infrastructure/browserProvider';
import { RobotsTxt } from '../../service/robotsTxt';
import { RobotsTxtCache } from '../../service/robotsTxtCache';
import { RobotsTxtFetcher } from '../../service/robotsTxtFetcher';
import { LoggerFactory } from '../../util/logging/loggerFactory';

const STATUS_CODE_OK = 200;
const STATUS_CODE_MULTIPLE_CHOICE = 300;
const ROBOTS_TXT_CACHE_KEY_PREFIX = 'robotstxt:';
const IGNORED_RESOURCE_TYPES: ResourceType[] = ['font', 'image', 'media', 'stylesheet'];

@Injectable({
  scope: ProviderScope.Session,
  overwrite: false,
})
export class DocumentDataSource extends BrowserDataSource<Context, Document> implements OnResponse {
  private robotsTxtCache!: RobotsTxtCache;

  public constructor(browserProvider: BrowserProvider, private readonly robotsTxtFetcher: RobotsTxtFetcher) {
    super(browserProvider, LoggerFactory.getLogger(DocumentDataSource.name));
  }

  public initialize(config: DataSourceConfig<Context>): void {
    const { cache } = config;
    this.robotsTxtCache = new RobotsTxtCache(new PrefixingKeyValueCache(cache, ROBOTS_TXT_CACHE_KEY_PREFIX));
  }

  protected async willSendRequest(
    url: Url,
    waitUntil: LoadEvent = LoadEvent.LOAD,
    options: Options = {}
  ): Promise<void> {
    const robotsTxt = await this.getRobotsTxt(url);
    if (!robotsTxt.isAllowed(url, options.userAgent)) {
      throw new Error(`URL is not allowed to fetch by robots.txt: ${format(url)}`);
    }
  }

  protected async didReceiveResponse(page: Page, response: Response): Promise<Document> {
    const status = response.status();
    const urlString = page.url();
    if (status >= STATUS_CODE_OK && status < STATUS_CODE_MULTIPLE_CHOICE) {
      this.logger.info("Received successful status '%d' from %s", status, urlString);
    } else {
      this.logger.warn("Received non-successful status '%d' from %s", status, urlString);
    }
    return create(page);
  }

  protected interceptRequest(request: Request): void {
    if (!this.headless) {
      // noinspection JSIgnoredPromiseFromCall
      request.continue();
      return;
    }

    if (IGNORED_RESOURCE_TYPES.includes(request.resourceType())) {
      // noinspection JSIgnoredPromiseFromCall
      request.abort('aborted');
    } else {
      // noinspection JSIgnoredPromiseFromCall
      request.continue();
    }
  }

  public async onResponse(): Promise<void> {
    await this.dispose();
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
