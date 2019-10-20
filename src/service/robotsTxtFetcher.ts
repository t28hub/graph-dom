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
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { format, Url } from 'url';
import { RobotsTxt } from './robotsTxt';
import { AxiosProvider } from '../infrastructure/axiosProvider';
import { NetworkError } from '../domain/errors';
import { Logger } from '../util/logging/logger';
import { LoggerFactory } from '../util/logging/loggerFactory';

const STATUS_CODE_OK = 200;

@Injectable({
  scope: ProviderScope.Application,
  overwrite: false,
})
export class RobotsTxtFetcher {
  private readonly axios: AxiosInstance;
  private readonly logger: Logger;

  public constructor(axiosProvider: AxiosProvider) {
    this.axios = axiosProvider.provideInstance();
    this.logger = LoggerFactory.getLogger(RobotsTxtFetcher.name);
  }

  public async fetch(url: Url): Promise<RobotsTxt> {
    const robotsUrl: string = format(RobotsTxtFetcher.buildRobotsTxtUrl(url));
    this.logger.info('Fetching robots.txt file from %s', robotsUrl);

    try {
      const response: AxiosResponse<string> = await this.fetchText(robotsUrl);
      const { status, statusText } = response;
      this.logger.info('Received response %d %s from %s', status, statusText, robotsUrl);

      const content = status === STATUS_CODE_OK ? response.data : '';
      return RobotsTxt.parse(url, content);
    } catch (e) {
      this.logger.warn('Failed to fetch robots.txt from %s: %s', robotsUrl, e.message);
      throw new NetworkError(`Failed to fetch robots.txt from ${robotsUrl}`);
    }
  }

  private async fetchText(urlString: string): Promise<AxiosResponse<string>> {
    const config: AxiosRequestConfig = {
      responseType: 'text',
      validateStatus: (): boolean => true,
    };
    return await this.axios.get<string>(urlString, config);
  }

  public static buildRobotsTxtUrl(url: Url): Url {
    const { protocol, host } = url;
    return {
      protocol,
      host,
      pathname: '/robots.txt',
    };
  }
}
