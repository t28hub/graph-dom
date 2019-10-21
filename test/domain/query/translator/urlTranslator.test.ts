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

import { UserInputError } from 'apollo-server-errors';
import each from 'jest-each';
import { UrlTranslator } from '../../../../src/domain/query/translator';

describe('UrlTranslator', () => {
  const translator = new UrlTranslator();
  describe('translate', () => {
    each([
      ['http://example.com', { protocol: 'http:', hostname: 'example.com', port: null, path: '/' }],
      ['https://example.com', { protocol: 'https:', hostname: 'example.com', port: null, path: '/' }],
      ['https://example.com:8080', { protocol: 'https:', hostname: 'example.com', port: '8080', path: '/' }],
      ['https://example.com/path', { protocol: 'https:', hostname: 'example.com', port: null, path: '/path' }]
    ]).test('should return parsed URL: URL=%s', (input: string, expected: { [name: string]: any }) => {
      // Act
      const actual = translator.translate(input);

      // Assert
      expect(actual).toMatchObject(expected);
    });

    each([
      ['', 'URL must not be empty'],
      ['https://user:p@ssw0rd%@example.com/', 'URL is invalid: URL=https://user:p@ssw0rd%@example.com/'],
      ['//example.com/', 'URL must contain protocol: URL=//example.com/'],
      ['ftp://user:p@ssw0rd@example.com:21/path', 'URL contains disallowed protocol: protocol=ftp:']
    ]).test('should throw an UserInputError: URL=%s', (input: string, expected: string) => {
      // Assert
      expect(() => {
        // Act
        translator.translate(input)
      }).toThrowError(new UserInputError(expected));
    });
  });
});
