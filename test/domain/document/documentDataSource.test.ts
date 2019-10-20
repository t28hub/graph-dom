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
import { DataSourceConfig } from 'apollo-datasource';
import log4js from 'log4js';
import { parse } from 'url';
import { logger } from '../../../src/__mocks__/log4js';
import puppeteer, { browser, page, response } from '../../../src/__mocks__/puppeteer';
import { NodeType } from '../../../src/domain';
import { Context } from '../../../src/context';
import { DocumentDataSource } from '../../../src/domain/document/documentDataSource';
import { RobotsTxtFetcher } from '../../../src/service/robotsTxtFetcher';
import { RobotsTxt } from '../../../src/service/robotsTxt';
import { BrowserProvider } from '../../../src/infrastructure/browserProvider';

jest.mock('log4js');
jest.mock('chrome-aws-lambda', () => {
  return { puppeteer };
});
jest.mock('../../../src/domain/document', () => {
  return {
    create: () => ({
      title: 'Example Domain',
      nodeName: '#document',
      nodeType: NodeType.DOCUMENT_NODE,
      nodeValue: null
    })
  };
});

describe('DocumentDataSource', () => {
  const fetcher = {
    fetch: jest.fn()
  };

  const { injector } = new GraphQLModule({
    providers: [
      {
        provide: BrowserProvider,
        overwrite: true,
        useValue: {
          path: '/path/to/browser',
          headless: true,
          connect: jest.fn(),
          provideBrowser: jest.fn()
        }
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
  const context = { injector };
  const config: DataSourceConfig<Context> = { cache, context };

  const url = parse('https://example.com/');
  let dataSource!: DocumentDataSource;
  beforeEach(() => {
    jest.resetAllMocks();

    (log4js.getLogger as jest.Mock).mockReturnValue(logger);
    browser.newPage.mockReturnValue(Promise.resolve(page));

    const browserProvider = injector.get(BrowserProvider);
    (browserProvider.connect as jest.Mock).mockReturnValue(browser);

    const robotsTxtFetcher = injector.get(RobotsTxtFetcher);

    dataSource = new DocumentDataSource(browserProvider, robotsTxtFetcher);
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
    beforeEach(() => {
      page.goto.mockReturnValue(Promise.resolve(response));
    });

    test('should return document when status is successful', async () => {
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
      response.status.mockReturnValue(200);
      dataSource.initialize(config);

      // Act
      const actual = await dataSource.request(url);

      // Assert
      expect(actual).toMatchObject({
        title: 'Example Domain',
        nodeName: '#document',
        nodeType: NodeType.DOCUMENT_NODE,
        nodeValue: null,
      });
    });

    test('should return document when status is not successful', async () => {
      // Arrange
      cache.get.mockReturnValue(Promise.resolve(''));
      response.status.mockReturnValue(400);
      dataSource.initialize(config);

      // Act
      const actual = await dataSource.request(url);

      // Assert
      expect(actual).toMatchObject({
        title: 'Example Domain',
        nodeName: '#document',
        nodeType: NodeType.DOCUMENT_NODE,
        nodeValue: null,
      });
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
      dataSource.initialize(config);

      // Act
      const actual = await dataSource.request(url);

      // Assert
      expect(actual).toMatchObject({
        title: 'Example Domain',
        nodeName: '#document',
        nodeType: NodeType.DOCUMENT_NODE,
        nodeValue: null,
      });
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
      const actual = dataSource.request(url);

      // Assert
      await expect(actual).rejects.toThrow(/^URL is not allowed to fetch by robots.txt: .+/);
    });
  });

  describe('onResponse', () => {
    test('should dispose data source', async () => {
      // Arrange
      const spiedDispose = jest.spyOn(dataSource, 'dispose');

      // Act
      await dataSource.onResponse();

      // Assert
      expect(spiedDispose).toBeCalledTimes(1);
    });
  });
});
