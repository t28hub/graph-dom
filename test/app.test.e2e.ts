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
  });

  describe('POST /graphql', () => {
    describe('ping', () => {
      const pingQuery = `
        query PingQuery {
          ping
        }
      `;

      test('should respond 200 with "pong"', async () => {
        // Arrange
        const query = await readFixtureFile('ping.query.graphql');
        const expected = await readFixtureJson('ping.json');

        // Act
        const response = await post({ query });

        // Assert
        const { status, body } = response;
        expect(status).toBe(200);
        expect(body.data).toBeDefined();
        expect(body.errors).toBeUndefined();
        expect(body).toMatchObject(expected);
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
        graphqlFile                         | expectedFile
        ${'page.single.query.graphql'}      | ${'page.single.json'}
        ${'page.multiple.query.graphql'}    | ${'page.multiple.json'}
        ${'page.redirect.query.graphql'}    | ${'page.redirect.json'}
      `.test('should respond 200 with data: query=$graphqlFile', async ({ graphqlFile, expectedFile }: { [name: string]: string }) => {
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

      each([
        ['ACCESS_DISALLOWED', 'http://httpbin.org/deny'],
        ['BAD_USER_INPUT', ''],
        ['BAD_USER_INPUT', 'https://user:%@example.com/'],
        ['BAD_USER_INPUT', '//example.com'],
        ['BAD_USER_INPUT', 'ftp://user:p@ssw0rd@example.com/path'],
        ['NOT_AVAILABLE', 'http://localhost:3000/'],
        ['NOT_AVAILABLE', 'https://test.example.com/'],
        ['SSL_CERTIFICATE', 'https://expired.badssl.com/'],
        ['SSL_CERTIFICATE', 'https://wrong.host.badssl.com/'],
        ['SSL_CERTIFICATE', 'https://self-signed.badssl.com/'],
        ['SSL_CERTIFICATE', 'https://untrusted-root.badssl.com/'],
        ['SSL_CERTIFICATE', 'https://revoked.badssl.com/']
      ]).test('should respond with error code %s: URL="%s"', async (code: string, url: string) => {
        // Arrange
        const query = await readFixtureFile('page.title.query.graphql');
        const variables = { url };

        // Act
        const response = await post({ query, variables });

        // Assert
        const { status, body } = response;
        expect(status).toBe(200);
        expect(body.data).toBeNull();
        expect(body.errors).toBeDefined();
        expect(body.errors).toMatchObject([
          {
            extensions: { code }
          }
        ]);
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
      each([
        [
          'options.cookies.query.graphql',
          {
            cookies: {
              '_id': 'abcdefghijk',
              'name': 'alice'
            }
          }
        ],
        [
          'options.headers.query.graphql',
          {
            headers: {
              'X-Graph-Dom-Mode': 'development',
              'X-Graph-Dom-Version': '1.0.0'
            }
          }
        ],
        [
          'options.userAgent.query.graphql',
          {
            'user-agent': 'GraphDOM/1.0.0'
          }
        ],
        [
          'options.credentials.query.graphql',
          {
            'authenticated': true,
            'user': 'alice'
          }
        ]
      ]).test('should contain body %p %p', async (fixtureFile: string, expected: { [name: string]: any }) => {
        // Arrange
        const query = await readFixtureFile(fixtureFile);

        // Act
        const response = await post({ query });

        // Assert
        const { status, body } = response;
        expect(status).toBe(200);
        expect(body.data).toBeDefined();
        expect(body.errors).toBeUndefined();

        const json = JSON.parse(body.data.page.body.json);
        expect(json).toMatchObject(expected);
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
