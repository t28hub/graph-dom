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
import { resolve } from 'path';
import supertest, { Test } from 'supertest';
import app from '../src/app';

jest.unmock('puppeteer');

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

describe('API', () => {
  beforeAll(() => {
    jest.setTimeout(30000);
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

    test('should respond 200 with title', async () => {
      // Arrange
      const query = await readGraphqlFile('pageTitleQuery.graphql');
      const expected = await readExpectedJson('pageTitle.json');

      // Act
      const response = await postQuery({
        operationName: 'PageTitle',
        query
      });

      // Assert
      const { status, body } = response;
      expect(status).toBe(200);
      expect(body).toMatchObject(expected);
      expect(body).not.toHaveProperty('errors');
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
        .set('Content-Type', 'application/json; charset=utf-8')
        .send();

      // Assert
      const { status, body } = response;
      expect(status).toBe(500);
      expect(body).toEqual({});
    });
  });
});
