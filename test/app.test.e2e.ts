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

import { promises } from 'fs';
import each from 'jest-each';
import { resolve } from 'path';
import supertest, { Test } from 'supertest';
import app from '../src/app';
import { AppModule } from '../src/appModule';
import { Browser } from 'puppeteer';
import { BrowserProvider } from '../src/infrastructure/browserProvider';
import { Logger } from '../src/util/logging/logger';
import { LoggerProvider } from '../src/infrastructure/loggerProvider';

jest.unmock('puppeteer');
jest.setTimeout(30000);

const readGraphqlFile = async (name: string): Promise<string> => {
  const path = resolve(__dirname, './fixtures/graphql/', name);
  return await promises.readFile(path, { encoding: 'utf8', flag: 'r' });
};

const readExpectedJson = async (name: string): Promise<object> => {
  const path = resolve(__dirname, './fixtures/expected/', name);
  const text = await promises.readFile(path, { encoding: 'utf8', flag: 'r' });
  return JSON.parse(text);
};

interface Payload {
  readonly operationName?: string;
  readonly query: string;
  readonly variables?: { [name: string]: any };
}

const postQuery = (payload: Payload): Test => {
  return supertest(app)
    .post('/graphql')
    .set('Content-Type', 'application/json; charset=utf-8')
    .send(payload);
};

describe('App', () => {
  const { injector } = AppModule;

  let browser!: Browser;
  let logger!: Logger;
  beforeAll(async () => {
    browser = await injector.get(BrowserProvider).provideBrowser();
    logger = injector.get(LoggerProvider).provideLogger('App E2E');
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('POST /graphql', () => {
    test('should respond 200 with required headers', async () => {
      // Arrange
      const query = await readGraphqlFile('typenameQuery.graphql');
      const expected = await readExpectedJson('typename.json');

      // Act
      const response = await postQuery({ query });

      // Assert
      const { status, header, body } = response;
      expect(status).toBe(200);
      expect(header).toMatchObject({
        'content-type':'application/json; charset=utf-8',
        'strict-transport-security': expect.anything(),
        'x-download-options': 'noopen',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'x-xss-protection': '1; mode=block',
      });
      expect(header).not.toMatchObject({
        'x-powered-by': expect.anything(),
        'server': expect.anything()
      });
      expect(body).toMatchObject(expected);
    });

    each`
      graphqlFile                             | expectedFile
      ${'pageTitleQuery.graphql'}             | ${'pageTitle.json'}
      ${'multiplePagesQuery.graphql'}         | ${'multiplePages.json'}
    `.test('should respond 200 with data: $graphqlFile', async ({ graphqlFile, expectedFile }: { [name: string]: string }) => {
      // Arrange
      const query = await readGraphqlFile(graphqlFile);
      const expected = await readExpectedJson(expectedFile);

      // Act
      const response = await postQuery({ query });

      // Assert
      const { status, body } = response;
      logger.info('Received %d %p', status, body);
      expect(status).toBe(200);
      expect(body).toMatchObject(expected);
      expect(body).not.toHaveProperty('errors');
    });

    each`
      graphqlFile                             | expectedFile
      ${'emptyUrlQuery.graphql'}              | ${'emptyUrl.json'} 
      ${'invalidUrlQuery.graphql'}            | ${'invalidUrl.json'} 
      ${'disallowedProtocolUrlQuery.graphql'} | ${'disallowedProtocolUrl.json'} 
      ${'missingProtocolUrlQuery.graphql'}    | ${'missingProtocolUrl.json'} 
    `.test('should respond 200 with BAD_USER_INPUT error: $graphqlFile', async ({ graphqlFile, expectedFile }: { [name: string]: string }) => {
      // Arrange
      const query = await readGraphqlFile(graphqlFile);
      const expected = await readExpectedJson(expectedFile);

      // Act
      const response = await postQuery({ query });

      // Assert
      const { status, body } = response;
      logger.info('Received %d %p', status, body);
      expect(status).toBe(200);
      expect(body).toMatchObject(expected);
    });

    test('should respond GraphQL schema', async () => {
      // Arrange
      const query = await readGraphqlFile('introspectionQuery.graphql');
      const expected = await readExpectedJson('introspection.json');

      const response = await postQuery({
        operationName: 'IntrospectionQuery',
        query
      });

      // Assert
      const { status, body } = response;
      expect(status).toBe(200);
      expect(body).toMatchObject(expected);
    });

    test('should respond 400 when method is not POST', async () => {
      // Act
      const response = await supertest(app)
        .get('/graphql')
        .set('Content-Type', 'application/json; charset=utf-8');

      // Assert
      const { status, body } = response;
      expect(status).toBe(400);
      expect(body).toEqual({});
    });

    test('should respond 500 when body is missing', async () => {
      // Act
      const response = await supertest(app)
        .post('/graphql')
        .set('Content-Type', 'application/json; charset=utf-8');

      // Assert
      const { status, body } = response;
      expect(status).toBe(500);
      expect(body).toEqual({});
    });
  });
});
