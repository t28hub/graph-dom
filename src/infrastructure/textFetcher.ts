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
import { format, UrlObject } from 'url';
import { AxiosProvider } from './axiosProvider';
import { Logger } from '../util/logging/logger';
import { NetworkError } from '../domain/errors';
import { check } from '../util';
import { LoggerFactory } from '../util/logging/loggerFactory';

const STATUS_CODE_SUCCESS = 200;
const STATUS_CODE_REDIRECTION = 300;

export type Headers = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [name: string]: any;
};

@Injectable({
  scope: ProviderScope.Application,
  overwrite: false,
})
export class TextFetcher {
  private readonly axios: AxiosInstance;
  private readonly logger: Logger;

  public constructor(axiosProvider: AxiosProvider) {
    this.axios = axiosProvider.provideInstance();
    this.logger = LoggerFactory.getLogger(TextFetcher.name);
  }

  public async fetch(url: UrlObject, timeout: number, headers: Headers = {}): Promise<string> {
    check(timeout >= 0, `Timeout must be positive: timeout=${timeout}`, TypeError);

    const urlString = format(url);
    this.logger.info('Fetching text from %s', urlString);
    try {
      const response = await this.request(urlString, timeout, headers);
      const { status, statusText, data } = response;
      this.logger.info('Received response %d %s from %s', status, statusText, urlString);
      return data;
    } catch (e) {
      this.logger.warn('Failed to fetch text from %s: %s', urlString, e.message);
      throw new NetworkError(`Failed to fetch text from ${urlString}`);
    }
  }

  private async request(url: string, timeout: number, headers: {}): Promise<AxiosResponse<string>> {
    const config: AxiosRequestConfig = {
      url,
      timeout,
      headers,
      method: 'GET',
      responseType: 'text',
      validateStatus: (status: number): boolean => {
        return status >= STATUS_CODE_SUCCESS && status < STATUS_CODE_REDIRECTION;
      },
    };
    return await this.axios.request(config);
  }
}
