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
import { assertWrappingType } from 'graphql';
import each from 'jest-each';
import { resolve } from 'path';
import supertest, { Test } from 'supertest';
import { logger } from '../src/__mocks__/log4js';
import app from '../src/app';
import { AppModule } from '../src/appModule';
import { BrowserProvider } from '../src/infrastructure/browserProvider';
import { CacheProvider } from '../src/infrastructure/cacheProvider';
import log4js from 'log4js';

jest.mock('log4js');
jest.unmock('apollo-server-cache-redis');
jest.unmock('apollo-server-caching');
jest.unmock('puppeteer');
jest.setTimeout(5000);

async function readFixtureFile(name: string): Promise<string> {
  const path = resolve(__dirname, './__fixtures__/', name);
  return await promises.readFile(path, { encoding: 'utf8', flag: 'r' });
}

async function readFixtureJson(name: string): Promise<{ [name: string]: any }> {
  const text = await readFixtureFile(name);
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
  beforeAll(() => {
    (log4js.getLogger as jest.Mock).mockReturnValue(logger);
  });

  afterAll(async () => {
    const { injector } = AppModule;
    await injector.get(CacheProvider).dispose();
    await injector.get(BrowserProvider).dispose();
  });

  describe('POST /graphql', () => {
    describe('ping', () => {
      const pingQuery = `
        query PingQuery {
          ping
        }
      `;

      test('should respond 200 with "pong"', async () => {
        // Act
        const response = await post({ query: pingQuery });

        // Assert
        const { status, body } = response;
        expect(status).toBe(200);
        expect(body.data).toBeDefined();
        expect(body.errors).toBeUndefined();
        expect(body).toMatchObject({
          data: {
            ping: 'pong'
          }
        });
      });

      test('should respond required headers', async () => {
        // Act
        const response = await post({ query: pingQuery });

        // Assert
        const { header } = response;
        expect(header).toMatchObject({
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
    });

    describe('page', () => {
      each`
        graphqlFile                       | expectedFile
        ${'page.single.query.graphql'}    | ${'page.single.json'}
        ${'page.multiple.query.graphql'}  | ${'page.multiple.json'}
      `.test('should respond 200 with data: $graphqlFile', async ({ graphqlFile, expectedFile }: { [name: string]: string }) => {
        // Arrange
        const query = await readFixtureFile(graphqlFile);
        const expected = await readFixtureJson(expectedFile);

        // Act
        const response = await post({ query });

        // Assert
        const { status, body } = response;
        expect(status).toBe(200);
        expect(body.data).toBeDefined();
        expect(body.errors).toBeUndefined();
        expect(body).toMatchObject(expected);
      });
    });

    describe('url', () => {
      each`
      graphqlFile                               | expectedFile
      ${'url.empty.query.graphql'}              | ${'url.empty.json'} 
      ${'url.invalid.query.graphql'}            | ${'url.invalid.json'} 
      ${'url.disallowedProtocol.query.graphql'} | ${'url.disallowedProtocol.json'} 
      ${'url.missingProtocol.query.graphql'}    | ${'url.missingProtocol.json'} 
    `.test('should respond 200 with BAD_USER_INPUT error: $graphqlFile', async ({ graphqlFile, expectedFile }: { [name: string]: string }) => {
        // Arrange
        const query = await readFixtureFile(graphqlFile);
        const expected = await readFixtureJson(expectedFile);

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

    describe('timeout', () => {
      test('should respond error when timeout exceeded', async () => {
        // Arrange
        const query = await readFixtureFile('timeout.exceeding.query.graphql');
        const expected = await readFixtureJson('timeout.exceeding.json');

        // Act
        const response = await post({ query });

        // Assert
        const { status, body } = response;
        expect(status).toBe(200);
        expect(body.data).toBeNull();
        expect(body.errors).toBeDefined();
        expect(body).toMatchObject(expected);
      });

      test('should respond error when timeout is negative', async () => {
        // Arrange
        const query = await readFixtureFile('timeout.negative.query.graphql');
        const expected = await readFixtureJson('timeout.negative.json');

        // Act
        const response = await post({ query });

        // Assert
        const { status, body } = response;
        expect(status).toBe(200);
        expect(body.data).toBeNull();
        expect(body.errors).toBeDefined();
        expect(body).toMatchObject(expected);
      });

      test('should not respond error when timeout not exceeded', async () => {
        // Arrange
        const query = await readFixtureFile('timeout.notExceeding.query.graphql');
        const expected = await readFixtureJson('timeout.notExceeding.json');

        // Act
        const response = await post({ query });

        // Assert
        const { status, body } = response;
        expect(status).toBe(200);
        expect(body.data).toBeDefined();
        expect(body.errors).toBeUndefined();
        expect(body).toMatchObject(expected);
      });
    });

    describe('options', () => {
      test('should append cookies to headers', async () => {
        // Arrange
        const query = await readFixtureFile('options.cookies.query.graphql');

        // Act
        const response = await post({ query });

        // Assert
        const { status, body } = response;
        expect(status).toBe(200);
        expect(body.data).toBeDefined();
        expect(body.errors).toBeUndefined();
        expect(body.data.page.body.json).toBeDefined();
        expect(body.data.page.body.json).toMatch('"Cookie": "_id=abcdefghijk; name=alice"');
      });


      test('should append user agent to headers', async () => {
        // Arrange
        const query = await readFixtureFile('options.userAgent.query.graphql');

        // Act
        const response = await post({ query });

        // Assert
        const { status, body } = response;
        expect(status).toBe(200);
        expect(body.data).toBeDefined();
        expect(body.errors).toBeUndefined();
        expect(body.data.page.body.json).toBeDefined();
        expect(body.data.page.body.json).toMatch('"user-agent": "GraphDOM/1.0.0"');
      });
    });

    describe('introspection', () => {
      test('should respond 200 with GraphQL schema', async () => {
        // Arrange
        const query = await readFixtureFile('introspection.query.graphql');
        const expected = await readFixtureJson('introspection.json');

        const response = await post({ query });

        // Assert
        const { status, body } = response;
        expect(status).toBe(200);
        expect(body.data).toBeDefined();
        expect(body.errors).toBeUndefined();
        expect(body).toMatchObject(expected);
      });
    });

    test('should respond 500 when body is missing', async () => {
      // Act
      const response = await post();

      // Assert
      const { status, body } = response;
      expect(status).toBe(500);
      expect(body).toEqual({});
    });
  });
});
