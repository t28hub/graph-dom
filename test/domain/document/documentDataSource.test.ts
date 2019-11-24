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
import puppeteer, { browser, page, response } from '../../../src/__mocks__/puppeteer-core';
import { NodeType } from '../../../src/domain';
import { Context } from '../../../src/context';
import { DocumentDataSource } from '../../../src/domain/document/documentDataSource';
import { BrowserProvider } from '../../../src/infrastructure/browserProvider';
import { TextFetcher } from '../../../src/infrastructure/textFetcher';
import { RobotsService } from '../../../src/domain/robots/robotsService';
import { CacheProvider } from '../../../src/infrastructure/cacheProvider';
import { RobotsTxtTranslator } from '../../../src/domain/robots/translator/robotsTxtTranslator';

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
  const browserProvider = {
    path: '/path/to/browser',
    headless: true,
    provide: jest.fn(),
    dispose: jest.fn(),
  };

  const robotsService = {
    isAccessible: jest.fn()
  };

  const { injector } = new GraphQLModule({
    providers: [
      {
        provide: BrowserProvider,
        overwrite: true,
        useValue: browserProvider
      },
      {
        provide: RobotsService,
        overwrite: true,
        useValue: robotsService
      },
      DocumentDataSource,
    ],
  });

  const url = parse('https://example.com/');
  let dataSource!: DocumentDataSource;
  beforeEach(() => {
    jest.resetAllMocks();

    (log4js.getLogger as jest.Mock).mockReturnValue(logger);
    browser.newPage.mockReturnValue(Promise.resolve(page));

    const browserProvider = injector.get(BrowserProvider);
    (browserProvider.provide as jest.Mock).mockReturnValue(browser);

    dataSource = injector.get(DocumentDataSource);
  });

  describe('request', () => {
    beforeEach(() => {
      page.goto.mockReturnValue(Promise.resolve(response));
    });

    test('should return document when status is successful', async () => {
      // Arrange
      robotsService.isAccessible.mockReturnValue(Promise.resolve(true));
      response.status.mockReturnValue(200);

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
      robotsService.isAccessible.mockReturnValue(Promise.resolve(true));
      response.status.mockReturnValue(400);

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
      robotsService.isAccessible.mockReturnValue(Promise.resolve(false));

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
