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
import axios from 'axios';
import each from 'jest-each';
import { parse } from 'url';
import { RobotsTxtFetcher } from '../../src/service/robotsTxtFetcher';
import { GraphQLModule } from '@graphql-modules/core';
import { AxiosProvider } from '../../src/infrastructure/axiosProvider';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RobotsTxtFetcher', () => {
  const axiosProvider = {
    provideInstance: () => mockedAxios
  };

  const loggerProvider = {
    provideLogger: jest.fn()
  };

  const { injector } = new GraphQLModule({
    providers: [
      {
        provide: AxiosProvider,
        overwrite: true,
        useValue: axiosProvider
      }
    ]
  });

  let fetcher!: RobotsTxtFetcher;
  beforeEach(() => {
    jest.clearAllMocks();

    loggerProvider.provideLogger.mockReturnValue({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      trace: jest.fn()
    });

    fetcher = new RobotsTxtFetcher(injector.get(AxiosProvider));
  });

  describe('fetch', () => {

    each([
      'https://example.com',
      'https://example.com/',
      'https://example.com/test/',
      'https://example.com/test/index.html',
      'https://example.com/test/index.html?query=example',
      'https://example.com/test/index.html?query=example#title',
    ]).test('should open robots.txt from %s', async (urlString: string) => {
      // Arrange
      const content = `
          User-Agent: *
          Allow: /
        `;
      mockedAxios.get.mockImplementation(async () => {
        return { status: 200, statusText: 'OK', data: content };
      });

      // Act
      const url = parse(urlString);
      const actual = await fetcher.fetch(url);

      // Assert
      expect(mockedAxios.get).toBeCalledWith(
        'https://example.com/robots.txt',
        { responseType: 'text', validateStatus: expect.any(Function) }
      );
      expect(actual).toBeDefined();
    });

    test('should return RobotsTxt when received status is not 200', async () => {
      // Arrange
      mockedAxios.get.mockImplementation(async () => {
        return { status: 404, statusText: 'Not Found', data: 'URL is not found' };
      });

      // Act
      const parsed = parse('https://example.com');
      const actual = await fetcher.fetch(parsed);

      // Assert
      expect(mockedAxios.get).toBeCalledWith(
        'https://example.com/robots.txt',
        { responseType: 'text', validateStatus: expect.any(Function) }
      );
      expect(actual).toBeDefined();
      expect(actual.content).toBe('');
    });

    test('should throw an Error string when a request failed', async () => {
      // Arrange
      mockedAxios.get.mockImplementation(async () => {
        throw new Error('Unable to get request');
      });

      // Act
      await expect(fetcher.fetch(parse('https://example.com')))
        .rejects
        .toThrow('Failed to fetch robots.txt from https://example.com/robots.txt');

      // Assert
      expect(mockedAxios.get).toBeCalledWith(
        'https://example.com/robots.txt',
        { responseType: 'text', validateStatus: expect.any(Function) }
      );
    });
  });

  describe('buildRobotsTxtUrl', () => {
    each([
      'http://example.com',
      'https://example.com',
      'https://example.com/',
      'https://example.com:443/',
      'https://example.com/test/',
      'https://example.com/test/index.html',
      'https://example.com/test/index.html?query=example',
      'https://example.com/test/index.html?query=example#title',
    ]).test('should return robots.txt URL from %s', (urlString: string) => {
      // Act
      const url = parse(urlString);
      const actual = RobotsTxtFetcher.buildRobotsTxtUrl(url);

      // Assert
      expect(actual).toEqual({
        protocol: url.protocol,
        host: url.host,
        pathname: '/robots.txt',
      });
    });
  });
});
