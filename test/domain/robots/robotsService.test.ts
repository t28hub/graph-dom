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
import { KeyValueCache } from 'apollo-server-caching';
import each from 'jest-each';
import log4js from 'log4js';
import { parse } from 'url';
import { PrefixingKeyValueCache } from '../../../src/__mocks__/apollo-server-caching';
import { AxiosProvider } from '../../../src/infrastructure/axiosProvider';
import { CacheProvider } from '../../../src/infrastructure/cacheProvider';
import { TextFetcher } from '../../../src/infrastructure/textFetcher';
import { RobotsTxtTranslator } from '../../../src/domain/robots/translator/robotsTxtTranslator';
import { RobotsService } from '../../../src/domain/robots/robotsService';
import { logger } from '../../../src/__mocks__/log4js';

jest.mock('log4js');

describe('RobotsService', () => {
  const cache = {
    set: jest.fn(),
    get: jest.fn()
  };
  const cacheProvider = {
    provideCache: () => cache
  };

  const textFetcher = {
    fetch: jest.fn()
  };

  const { injector } = new GraphQLModule({
    providers: [
      {
        provide: CacheProvider,
        overwrite: true,
        useValue: cacheProvider
      },
      {
        provide: TextFetcher,
        overwrite: true,
        useValue: textFetcher
      },
      RobotsTxtTranslator,
      RobotsService
    ]
  });

  let service: RobotsService;
  beforeEach(() => {
    jest.resetAllMocks();
    (log4js.getLogger as jest.Mock).mockReturnValue(logger);

    PrefixingKeyValueCache.mockImplementation((cache: KeyValueCache<string>, prefix: string) => {
      return {
        get: (key: string) => {
          return cache.get(`${prefix}${key}`);
        },
        set: (key: string, value: string, options?: { ttl?: number }) => {
          return cache.set(`${prefix}${key}`, value, options);
        }
      };
    });

    service = injector.get(RobotsService);
  });

  describe('isAccessible', () => {
    test('should return whether accessible or not', async  () => {
      // Arrange
      const fetcher = injector.get(TextFetcher);
      const content = `
        User-Agent: *
        Disallow: /admin
        Allow: /
      `;
      const spiedFetch = jest.spyOn(fetcher, 'fetch');
      spiedFetch.mockReturnValue(Promise.resolve(content));

      // Actual
      const allowedUrl = parse('https://example.com/path');
      const allowedActual = await service.isAccessible(allowedUrl);

      const disallowedUrl = parse('https://example.com/admin');
      const disallowedActual = await service.isAccessible(disallowedUrl);

      // Assert
      expect(allowedActual).toBeTruthy();
      expect(disallowedActual).toBeFalsy();
    });

    test('should fetch robots.txt', async () => {
      // Arrange
      const fetcher = injector.get(TextFetcher);
      const spiedFetcher = jest.spyOn(fetcher, 'fetch');

      const content = `
        User-Agent: *
        Allow: /
      `;
      spiedFetcher.mockReturnValue(Promise.resolve(content));

      // Act
      const url = parse('https://example.com/path/to/file');
      await service.isAccessible(url);

      // Assert
      expect(fetcher.fetch).toBeCalledTimes(1);
      expect(fetcher.fetch).toBeCalledWith({
        protocol: 'https:',
        host: 'example.com',
        pathname: '/robots.txt'
      }, 2000, {});
    });

    test('should fetch and cache robots.txt when cache does not exist', async () => {
      // Arrange
      const fetcher = injector.get(TextFetcher);
      const content = `
        User-Agent: *
        Allow: /
      `;
      const spiedFetch = jest.spyOn(fetcher, 'fetch');
      spiedFetch.mockReturnValue(Promise.resolve(content));

      // Act
      const url = parse('https://example.com/path/to/file');
      const actual = await service.isAccessible(url);

      // Assert
      expect(actual).toBeTruthy();
      expect(cache.get).toBeCalledTimes(1);
      expect(cache.get).toBeCalledWith('robotstxt:https://example.com/robots.txt');
      expect(fetcher.fetch).toBeCalledTimes(1);
      expect(cache.set).toBeCalledTimes(1);
      expect(cache.set).toBeCalledWith('robotstxt:https://example.com/robots.txt', content, expect.anything());
    });

    test('should use cached robots.txt when cache exists', async () => {
      // Arrange
      const content = `
        User-Agent: *
        Allow: /
      `;
      cache.get.mockReturnValue(Promise.resolve(content));

      const fetcher = injector.get(TextFetcher);
      jest.spyOn(fetcher, 'fetch');

      // Act
      const url = parse('https://example.com');
      const actual = await service.isAccessible(url);

      // Assert
      expect(actual).toBeTruthy();
      expect(cache.get).toBeCalledTimes(1);
      expect(cache.get).toBeCalledWith('robotstxt:https://example.com/robots.txt');
      expect(fetcher.fetch).not.toBeCalled();
      expect(cache.set).not.toBeCalled();
    });

    test('should cache empty string when fetching is failed', async () => {
      // Arrange
      const fetcher = injector.get(TextFetcher);
      const reason = new Error('Robots.txt is not found');
      jest.spyOn(fetcher, 'fetch').mockReturnValue(Promise.reject(reason));

      // Act
      const url = parse('https://example.com');
      const actual = await service.isAccessible(url);

      // Assert
      expect(actual).toBeTruthy();
      expect(cache.set).toBeCalledTimes(1);
      expect(cache.set).toBeCalledWith('robotstxt:https://example.com/robots.txt', '', expect.anything());
    });
  });
});
