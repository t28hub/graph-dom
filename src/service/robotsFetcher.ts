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

import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { format, Url, UrlObject } from 'url';
import { RobotsTxt } from './robotsTxt';
import { getLogger, Logger } from '../util/logging';

const STATUS_CODE_OK = 200;

export class RobotsFetcher {
  private static readonly logger: Logger = getLogger(RobotsFetcher.name);

  public constructor(private readonly axios: AxiosInstance) {}

  public async fetch(url: Url): Promise<RobotsTxt> {
    const { logger } = RobotsFetcher;
    const robotsUrl: string = RobotsFetcher.buildRobotsUrl(url);
    logger.info('Fetching robots.txt file from %s', robotsUrl);

    const response: AxiosResponse<string> = await this.fetchText(robotsUrl);
    const { status, statusText } = response;
    logger.info('Received response %d %s from %s', status, statusText, robotsUrl);

    const content = status === STATUS_CODE_OK ? response.data : '';
    return RobotsTxt.parse(url, content);
  }

  private async fetchText(urlString: string): Promise<AxiosResponse<string>> {
    const { logger } = RobotsFetcher;
    try {
      const config: AxiosRequestConfig = {
        responseType: 'text',
      };
      return await this.axios.get<string>(urlString, config);
    } catch (e) {
      logger.warn('Failed to fetch text from %s: %s', urlString, e);
      throw new Error(`Failed to fetch text from ${urlString}`);
    }
  }

  private static buildRobotsUrl(url: Url): string {
    const { protocol, host } = url;
    const parts: UrlObject = {
      protocol,
      host,
      pathname: '/robots.txt',
    };
    return format(parts);
  }
}
