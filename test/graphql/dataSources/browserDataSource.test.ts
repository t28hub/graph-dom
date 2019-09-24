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

import { DataSourceConfig } from 'apollo-datasource';
import { KeyValueCache } from 'apollo-server-caching';
import axios from 'axios';
import { parse } from 'url';
import { Document, NodeType } from '../../../src/dom';
import { Context } from '../../../src/graphql/context';
import { BrowserDataSource } from '../../../src/graphql/dataSources/browserDataSource';
import { BrowserService } from '../../../src/service/browserService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../../src/util/logging');

const MockKeyValueCache: jest.Mock<KeyValueCache> = jest.fn(() => ({
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn()
}));

const MockContext: jest.Mock<Context> = jest.fn();

const MockBrowserService: jest.Mock<BrowserService> = jest.fn(() => ({
  open: jest.fn(),
  dispose: jest.fn()
}));

const MockDocument: jest.Mock<Document> = jest.fn<Document, [string, string, NodeType]>((title: string, nodeName: string, nodeType: NodeType) => ({
  title,
  nodeName,
  nodeType,
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
}));

describe('BrowserDataSource', () => {
  describe('initialize', () => {
    const dataSource = new BrowserDataSource();

    test('should setup internal properties', () => {
      // Arrange
      const config: DataSourceConfig<Context> = {
        cache: new MockKeyValueCache(),
        context: new MockContext()
      };
      expect(dataSource).not.toHaveProperty('browserService');
      expect(dataSource).not.toHaveProperty('robotsTxtCache');
      expect(dataSource).not.toHaveProperty('robotsTxtFetcher');

      // Act
      dataSource.initialize(config);

      // Assert
      // Due to this implementation is fragile, consider to use alternative way.
      expect(dataSource).toHaveProperty('browserService');
      expect(dataSource).toHaveProperty('robotsTxtCache');
      expect(dataSource).toHaveProperty('robotsTxtFetcher');
    });
  });

  describe('fetch', () => {
    const dataSource = new BrowserDataSource();

    let config!: DataSourceConfig<Context>;
    beforeEach(() => {
      mockedAxios.get.mockClear();

      config = {
        cache: new MockKeyValueCache(),
        context: {
          axios: mockedAxios,
          browser: new MockBrowserService(),
          dataSources: {
            browser: dataSource
          }
        }
      };
    });

    test('should return document', async () => {
      // Arrange
      (config.cache as jest.Mocked<KeyValueCache>).get.mockReturnValue(Promise.resolve(undefined));
      (config.context.axios as jest.Mocked<typeof axios>).get = jest.fn().mockReturnValue({
        status: 200,
        data: `
          User-Agent: *
          Allow: /
        `
      });
      (config.context.browser as jest.Mocked<BrowserService>).open.mockImplementation(() => {
        const document = new MockDocument('Example Domain', '#document', NodeType.DOCUMENT_NODE);
        return Promise.resolve(document);
      });
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
      expect(config.context.axios.get).toBeCalledTimes(1);
    });

    test('should return document when robots.txt is cached', async () => {
      // Arrange
      (config.cache as jest.Mocked<KeyValueCache>).get.mockImplementationOnce(() => {
        const content = `
          User-Agent: *
          Allow: /
        `;
        return Promise.resolve(content);
      });
      (config.context.browser as jest.Mocked<BrowserService>).open.mockImplementationOnce(() => {
        const document = new MockDocument('Example Domain', '#document', NodeType.DOCUMENT_NODE);
        return Promise.resolve(document);
      });
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
      expect(config.cache.set).not.toBeCalled();
      expect(config.context.axios.get).not.toBeCalled();
    });

    test('should throw an Error when URL is not allowed to fetch', async () => {
      // Arrange
      (config.cache as jest.Mocked<KeyValueCache>).get.mockReturnValue(Promise.resolve(undefined));
      (config.context.axios as jest.Mocked<typeof axios>).get = jest.fn().mockReturnValue({
        status: 200,
        data: `
          User-Agent: *
          Disallow: /
        `
      });
      dataSource.initialize(config);

      // Act
      const url = parse('https://example.com/');
      const actual = dataSource.fetch(url);

      // Assert
      await expect(actual).rejects.toThrow(/^URL is not allowed to fetch by robots.txt: .+/);
      expect(config.cache.get).toBeCalledTimes(1);
    });
  });
});
