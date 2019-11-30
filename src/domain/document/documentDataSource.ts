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
import { Page, Request, ResourceType, Response } from 'puppeteer';
import { format, Url } from 'url';
import { create } from '.';
import { Document } from '..';
import { BrowserDataSource, Options, LoadEvent } from '../browserDataSource';
import { Context } from '../../context';
import { BrowserProvider } from '../../infrastructure/browserProvider';
import { LoggerFactory } from '../../util/logging/loggerFactory';
import { RobotsService } from '../robots/robotsService';
import { AccessDisallowedError } from '../errors';

const STATUS_CODE_OK = 200;
const STATUS_CODE_MULTIPLE_CHOICE = 300;
const IGNORED_RESOURCE_TYPES: ResourceType[] = ['font', 'image', 'media', 'stylesheet'];

@Injectable({
  scope: ProviderScope.Session,
  overwrite: false,
})
export class DocumentDataSource extends BrowserDataSource<Context, Document> implements OnResponse {
  public constructor(browserProvider: BrowserProvider, private readonly robotsService: RobotsService) {
    super(browserProvider, LoggerFactory.getLogger(DocumentDataSource.name));
  }

  protected async willSendRequest(
    url: Url,
    waitUntil: LoadEvent = LoadEvent.LOAD,
    options: Options = {}
  ): Promise<void> {
    if (options.ignoreRobotsTxt) {
      this.logger.info('Checking robots.txt is ignored by options');
      return;
    }

    const isAccessible = await this.robotsService.isAccessible(url, options.userAgent);
    if (!isAccessible) {
      throw new AccessDisallowedError(`URL is not allowed to fetch by robots.txt: URL=${format(url)}`);
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
}
