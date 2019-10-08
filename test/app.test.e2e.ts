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
import { promises } from 'fs';
import each from 'jest-each';
import { resolve } from 'path';
import supertest, { Test } from 'supertest';
import app from '../src/app';
import { AppModule } from '../src/appModule';
import { BrowserProvider } from '../src/infrastructure/browserProvider';
import { RedisCacheProvider } from '../src/infrastructure/redisCacheProvider';

jest.unmock('apollo-server-cache-redis');
jest.unmock('puppeteer');
jest.setTimeout(10000);

async function readGraphqlFile(name: string): Promise<string> {
  const path = resolve(__dirname, './fixtures/graphql/', name);
  return await promises.readFile(path, { encoding: 'utf8', flag: 'r' });
}

async function readExpectedJson(name: string): Promise<object> {
  const path = resolve(__dirname, './fixtures/expected/', name);
  const text = await promises.readFile(path, { encoding: 'utf8', flag: 'r' });
  return JSON.parse(text);
}

function post(json?: any): Test {
  return supertest(app)
    .post('/graphql')
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json; charset=utf-8')
    .set('User-Agent', 'GraphDOM/1.0.0')
    .send(json);
}

describe('App', () => {
  afterAll(async () => {
    const { injector } = AppModule;
    await injector.get(RedisCacheProvider).dispose();
    await injector.get(BrowserProvider).dispose();
  });

  describe('POST /graphql', () => {
    test('should respond 200 with required headers', async () => {
      // Arrange
      const query = await readGraphqlFile('typenameQuery.graphql');

      // Act
      const response = await post({ query });

      // Assert
      const { status, header } = response;
      expect(status).toBe(200);
      expect(header).toMatchObject({
        'content-type': 'application/json; charset=utf-8',
        'strict-transport-security': expect.anything(),
        'x-download-options': 'noopen',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'x-xss-protection': '1; mode=block'
      });
      expect(header).not.toMatchObject({
        'x-powered-by': expect.anything(),
        'server': expect.anything()
      });
    });

    test('should respond 200 with __typename', async () => {
      // Arrange
      const query = await readGraphqlFile('typenameQuery.graphql');
      const expected = await readExpectedJson('typename.json');

      // Act
      const response = await post({ query });

      // Assert
      const { status, body } = response;
      expect(status).toBe(200);
      expect(body.data).toBeDefined();
      expect(body.errors).toBeUndefined();
      expect(body).toMatchObject(expected);
    });

    test('should respond 200 with GraphQL schema', async () => {
      // Arrange
      const query = await readGraphqlFile('introspectionQuery.graphql');
      const expected = await readExpectedJson('introspection.json');

      const response = await post({ query });

      // Assert
      const { status, body } = response;
      expect(status).toBe(200);
      expect(body.data).toBeDefined();
      expect(body.errors).toBeUndefined();
      expect(body).toMatchObject(expected);
    });

    test('should respond 500 when body is missing', async () => {
      // Act
      const response = await post();

      // Assert
      const { status, body } = response;
      expect(status).toBe(500);
      expect(body).toEqual({});
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
      const response = await post({ query });

      // Assert
      const { status, body } = response;
      expect(status).toBe(200);
      expect(body.data).toBeDefined();
      expect(body.errors).toBeUndefined();
      expect(body).toMatchObject(expected);
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
      const response = await post({ query });

      // Assert
      const { status, body } = response;
      expect(status).toBe(200);
      expect(body.data).toBeNull();
      expect(body.errors).toBeDefined();
      expect(body).toMatchObject(expected);
    });
  });
});
