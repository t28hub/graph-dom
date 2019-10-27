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
import { CacheProvider } from '../../src/infrastructure/cacheProvider';
import { RedisCache } from '../../src/__mocks__/apollo-server-cache-redis';
import { cache, InMemoryLRUCache } from '../../src/__mocks__/apollo-server-caching';

describe('CacheProvider', () => {
  const TestModule = new GraphQLModule();

  beforeEach(() => {
    jest.resetAllMocks();
    RedisCache.mockImplementation(() => cache);
    InMemoryLRUCache.mockImplementation(() => cache);
  });

  describe('onInit', () => {
    test('should instantiate InMemoryLRUCache when redis configuration is not set', () => {
      // Act
      const provider = new CacheProvider();
      provider.onInit(TestModule);

      // Assert
      expect(RedisCache).not.toBeCalled();
      expect(InMemoryLRUCache).toBeCalledTimes(1);
    });

    test('should instantiate RedisCache', () => {
      // Act
      const provider = new CacheProvider('127.0.0.1', 6379, 'p@ssw0rd');
      provider.onInit(TestModule);

      // Assert
      expect(RedisCache).toBeCalledTimes(1);
      expect(RedisCache).toBeCalledWith({
        host: '127.0.0.1',
        port: 6379,
        password: 'p@ssw0rd'
      });
      expect(InMemoryLRUCache).not.toBeCalled();
    });
  });

  describe('provideCache', () => {
    let provider!: CacheProvider;
    beforeEach(() => {
      provider = new CacheProvider('127.0.0.1', 6379);
    });

    test('should return shared RedisCache', () => {
      // Arrange
      provider.onInit(TestModule);

      // Act
      const actual1st = provider.provideCache();
      const actual2nd = provider.provideCache();

      // Assert
      expect(actual1st).toBe(actual2nd);
    });
  });

  describe('dispose', () => {
    test('should not close cache when instance is not RedisCache', async () => {
      // Arrange
      const cache = { flush: jest.fn() };
      InMemoryLRUCache.mockImplementation(() => cache);

      const provider = new CacheProvider();
      provider.onInit(TestModule);

      // Act
      await provider.dispose();

      // Assert
      expect(RedisCache).not.toBeCalled();
      expect(cache.flush).not.toBeCalled();
    });

    test('should close cache when instance is RedisCache', async () => {
      // Arrange
      const cache = { close: jest.fn() };
      RedisCache.mockImplementation(() => cache);

      const provider = new CacheProvider('127.0.0.1', 6379);
      provider.onInit(TestModule);

      // Act
      await provider.dispose();

      // Assert
      expect(RedisCache).toBeCalled();
      expect(cache.close).toBeCalledTimes(1);
    });
  });
});
