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
import { BrowserService, OpenOptions } from '../../service/browserService';
import { Logger } from '../../util/logger/logger';
import { getLogger } from '../../util/logger';
import { Context } from '../context';
import { format, Url } from 'url';
import { Document } from '../../dom';
import { RobotsTxtFetcher } from '../../service/robotsTxtFetcher';

export type Options = Partial<OpenOptions>;

export class BrowserDataSource extends DataSource<Context> {
  private context!: Context;

  public constructor(
    private readonly browserService: BrowserService,
    private readonly robotsTxtFetcher: RobotsTxtFetcher,
    private readonly logger: Logger = getLogger(BrowserDataSource.name)
  ) {
    super();
  }

  public initialize(config: DataSourceConfig<Context>): void {
    this.context = config.context;
  }

  public async fetch(url: Url, options: Options = {}): Promise<Document> {
    const robotsTxt = await this.robotsTxtFetcher.fetch(url);
    if (!robotsTxt.isAllowed(url, options.userAgent)) {
      throw new Error(`URL is not allowed to fetch: ${format(url)}`);
    }

    this.logger.info('Opening URL using browser: %s', format(url));
    const document = await this.browserService.open(url, options);
    this.logger.info('Received document from %s', format(url));
    return document;
  }

  public async close(): Promise<void> {
    await this.browserService.dispose();
  }
}
