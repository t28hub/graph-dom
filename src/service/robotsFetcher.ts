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
import { Logger } from '../util/logger/logger';
import { getLogger } from '../util/logger';

const STATUS_CODE_OK = 200;

export class RobotsFetcher {
  public constructor(
    private readonly axios: AxiosInstance,
    private readonly logger: Logger = getLogger(RobotsFetcher.name)
  ) {}

  public async fetch(url: Url): Promise<RobotsTxt> {
    const robotsUrl: string = RobotsFetcher.buildRobotsUrl(url);
    this.logger.info('Fetching robots.txt file from %s', robotsUrl);

    const response: AxiosResponse<string> = await this.fetchText(robotsUrl);
    const { status, statusText } = response;
    this.logger.info('Received response %d %s from %s', status, statusText, robotsUrl);

    if (status !== STATUS_CODE_OK) {
      throw new Error(`Received unexpected status '${status} ${statusText}' from ${robotsUrl}`);
    }
    return RobotsTxt.parse(url, response.data);
  }

  private async fetchText(urlString: string): Promise<AxiosResponse<string>> {
    try {
      const config: AxiosRequestConfig = {
        responseType: 'text',
      };
      return await this.axios.get<string>(urlString, config);
    } catch (e) {
      this.logger.warn('Failed to fetch text from %s: %s', urlString, e);
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
