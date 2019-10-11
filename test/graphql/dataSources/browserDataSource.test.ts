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
import { DataSourceConfig } from 'apollo-datasource';
import log4js from 'log4js';
import { parse } from 'url';
import { NodeType } from '../../../src/dom';
import { Context } from '../../../src/context';
import { BrowserDataSource } from '../../../src/graphql/dataSources/browserDataSource';
import { ChromeBrowserService } from '../../../src/service/chromeBrowserService';
import { GraphQLModule } from '@graphql-modules/core';
import { RobotsTxtFetcher } from '../../../src/service/robotsTxtFetcher';
import { RobotsTxt } from '../../../src/service/robotsTxt';
import { logger } from '../../../src/__mocks__/log4js';

jest.mock('log4js');

const document = {
  title: 'Example Domain',
  nodeName: '#document',
  nodeType: NodeType.DOCUMENT_NODE,
  nodeValue: null,
  textContent: null,
  children: jest.fn(),
  childNodes: jest.fn(),
  firstChild: jest.fn(),
  lastChild: jest.fn(),
  parentNode: jest.fn(),
  parentElement: jest.fn(),
  nextSibling: jest.fn(),
  previousSibling: jest.fn(),
  head: jest.fn(),
  body: jest.fn(),
  getElementById: jest.fn(),
  getElementsByClassName: jest.fn(),
  getElementsByTagName: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn()
};

describe('BrowserDataSource', () => {
  const browserService = {
    open: jest.fn(),
    dispose: jest.fn()
  };

  const fetcher = {
    fetch: jest.fn()
  };

  const { injector } = new GraphQLModule({
    providers: [
      {
        provide: ChromeBrowserService,
        overwrite: true,
        useValue: browserService
      },
      {
        provide: RobotsTxtFetcher,
        overwrite: true,
        useValue: fetcher
      }
    ],
  });

  const cache = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  };
  const context = {
    injector
  };
  const config: DataSourceConfig<Context> = { cache, context };

  let dataSource!: BrowserDataSource;
  beforeEach(() => {
    jest.resetAllMocks();

    (log4js.getLogger as jest.Mock).mockReturnValue(logger);

    dataSource = new BrowserDataSource(
      injector.get(ChromeBrowserService),
      injector.get(RobotsTxtFetcher),
    );
  });

  describe('initialize', () => {
    test('should setup internal properties', () => {
      // Arrange
      expect(dataSource).not.toHaveProperty('robotsTxtCache');

      // Act
      dataSource.initialize(config);

      // Assert
      // Due to this implementation is fragile, consider to use alternative way.
      expect(dataSource).toHaveProperty('robotsTxtCache');
    });
  });

  describe('fetch', () => {
    test('should return document', async () => {
      // Arrange
      cache.get.mockReturnValue(Promise.resolve(undefined));
      fetcher.fetch.mockImplementationOnce(() => {
        const url = parse('https://example.com/robots.txt');
        const content = `
          User-Agent: *
          Allow: /
        `;
        return RobotsTxt.parse(url, content);
      });
      browserService.open.mockReturnValueOnce(Promise.resolve(document));
      dataSource.initialize(config);

      // Act
      const url = parse('https://example.com/');
      const actual = await dataSource.fetch(url);

      // Assert
      expect(actual).toMatchObject({
        title: 'Example Domain',
        nodeName: '#document',
        nodeType: NodeType.DOCUMENT_NODE,
        nodeValue: null,
        textContent: null
      });
      expect(config.cache.get).toBeCalledTimes(1);
      expect(config.cache.set).toBeCalledTimes(1);
    });

    test('should return document when robots.txt is cached', async () => {
      // Arrange
      cache.get.mockImplementationOnce(() => {
        const content = `
          User-Agent: *
          Allow: /
        `;
        return Promise.resolve(content);
      });
      browserService.open.mockReturnValueOnce(Promise.resolve(document));
      dataSource.initialize(config);

      // Act
      const url = parse('https://example.com/');
      const actual = await dataSource.fetch(url);

      // Assert
      expect(actual).toMatchObject({
        title: 'Example Domain',
        nodeName: '#document',
        nodeType: NodeType.DOCUMENT_NODE,
        nodeValue: null,
        textContent: null
      });
      expect(cache.get).toBeCalledTimes(1);
      expect(cache.set).not.toBeCalled();
    });

    test('should throw an Error when URL is not allowed to fetch', async () => {
      // Arrange
      cache.get.mockReturnValue(Promise.resolve(undefined));
      fetcher.fetch.mockImplementationOnce(() => {
        const url = parse('https://example.com/robots.txt');
        const content = `
          User-Agent: *
          Disallow: /
        `;
        return RobotsTxt.parse(url, content);
      });
      dataSource.initialize(config);

      // Act
      const url = parse('https://example.com/');
      const actual = dataSource.fetch(url);

      // Assert
      await expect(actual).rejects.toThrow(/^URL is not allowed to fetch by robots.txt: .+/);
      expect(cache.get).toBeCalledTimes(1);
    });
  });
});
