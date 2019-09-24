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

import { parse, Url } from 'url';
import { KeyValueCache } from 'apollo-server-caching';
import { RobotsTxtCache } from '../../src/service/robotsTxtCache';
import { RobotsTxt } from '../../src/service/robotsTxt';

jest.mock('../../src/util/logging');

describe('RobotsTxtCache', () => {
  const mockedCache: KeyValueCache = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  };
  const cache = new RobotsTxtCache(mockedCache);

  beforeEach(() => {
    (mockedCache.get as jest.Mock).mockReset();
    (mockedCache.set as jest.Mock).mockReset();
    (mockedCache.delete as jest.Mock).mockReset();
  });


  describe('get', () => {
    test('should call get method with URL', async () => {
      // Act
      const url = parse('https://example.com/');
      await cache.get(url);

      // Assert
      expect(mockedCache.get).toBeCalledWith('https://example.com/');
    });

    test('should return value when cached value exists', async () => {
      // Arrange
      (mockedCache.get as jest.Mock).mockReturnValue('This is cached robots.txt.');

      // Act
      const url = parse('https://example.com/');
      const actual = await cache.get(url);

      // Assert
      expect(mockedCache.get).toBeCalledWith('https://example.com/');
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get()).toMatchObject({
        url: {
          protocol: 'https:',
          host: 'example.com',
          pathname: '/'
        } as Url,
        content: 'This is cached robots.txt.'
      });
    });

    test('should return empty when cached value does not exist', async () => {
      // Arrange
      (mockedCache.get as jest.Mock).mockReturnValue(undefined);

      // Act
      const url = parse('https://example.com/');
      const actual = await cache.get(url);

      // Assert
      expect(mockedCache.get).toBeCalledWith('https://example.com/');
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('set', () => {
    test('should call set method with URL and Robots.txt', async () => {
      // Act
      const url = parse('https://example.com/');
      const robotsTxt = RobotsTxt.parse(url, 'This is a robots.txt.');
      await cache.set(url, robotsTxt);

      // Assert
      expect(mockedCache.set).toBeCalledWith('https://example.com/', robotsTxt.content, { ttl: 3600 });
    });

    test('should call set method with URL, Robots.txt and ttl', async () => {
      // Act
      const url = parse('https://example.com/');
      const robotsTxt = RobotsTxt.parse(url, 'This is a robots.txt.');
      await cache.set(url, robotsTxt, 7200);

      // Assert
      expect(mockedCache.set).toBeCalledWith('https://example.com/', robotsTxt.content, { ttl: 7200 });
    });
  });

  describe('delete', () => {
    test('should call set method with URL', async () => {
      // Act
      const url = parse('https://example.com/');
      await cache.delete(url);

      // Assert
      expect(mockedCache.delete).toBeCalledWith('https://example.com/');
    });
  });
});
