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

import 'reflect-metadata';
import { GraphQLModule } from '@graphql-modules/core';
import axios from 'axios';
import { parse } from 'url';
import { logger } from '../../src/__mocks__/log4js';
import { AxiosProvider } from '../../src/infrastructure/axiosProvider';
import { TextFetcher } from '../../src/infrastructure/textFetcher';
import { NetworkError } from '../../src/domain/errors';
import log4js from 'log4js';

jest.mock('axios');
jest.mock('log4js');

describe('TextFetcher', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const axiosProvider = {
    provideInstance: () => mockedAxios
  };

  const { injector } = new GraphQLModule({
    providers: [
      {
        provide: AxiosProvider,
        overwrite: true,
        useValue: axiosProvider
      },
      TextFetcher
    ]
  });

  let fetcher!: TextFetcher;
  beforeEach(() => {
    jest.resetAllMocks();
    (log4js.getLogger as jest.Mock).mockReturnValue(logger);

    fetcher = injector.get(TextFetcher);
  });

  describe('fetch', () => {
    test('should return string when status is successful', async () => {
      // Arrange
      mockedAxios.request.mockReturnValue(Promise.resolve({
        status: 200,
        statusText: 'OK',
        data: 'Successful response body'
      }));

      // Act
      const url = parse('https://example.com');
      const actual = await fetcher.fetch(url, 1000);

      // Assert
      expect(actual).toEqual('Successful response body');
    });

    test('should throw a NetworkError when request is not successful', async () => {
      // Arrange
      mockedAxios.request.mockReturnValue(Promise.reject(new Error("Page not found")));

      // Act
      const url = parse('https://example.com');
      const actual = fetcher.fetch(url, 1000);

      // Assert
      await expect(actual).rejects.toThrowError(NetworkError);
    });

    test('should call axios.request with configuration', async () => {
      // Arrange
      mockedAxios.request.mockReturnValue(Promise.resolve({
        status: 200,
        statusText: 'OK'
      }));

      // Act
      const url = parse('https://example.com/search?q=graphql#results');
      await fetcher.fetch(url, 1000, { 'User-Agent': 'TestBot/1.0.0' });

      // Assert
      expect(mockedAxios.request).toBeCalledTimes(1);
      expect(mockedAxios.request).toBeCalledWith(expect.objectContaining({
        url: 'https://example.com/search?q=graphql#results',
        method: 'GET',
        timeout: 1000,
        headers: {'User-Agent':'TestBot/1.0.0'},
        responseType: 'text',
        validateStatus: expect.any(Function)
      }));
    });
  });
});
