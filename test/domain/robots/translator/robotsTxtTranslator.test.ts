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

import each from 'jest-each';
import { parse } from 'url';
import { RobotsTxtTranslator } from '../../../../src/domain/robots/translator/robotsTxtTranslator';

describe('RobotsTxtTranslator', () => {
  describe('translate', () => {
    const translator = new RobotsTxtTranslator();

    each([
      [
        'https://example.com',
        '',
      ],
      [
        'https://example.com',
        `
        User-agent: TestBot
        Disallow: /
        Disallow: /test
        `,
      ],
      [
        'https://example.com',
        `
        User-agent: *
        Disallow: /
        Allow: /test
        `,
      ]
    ]).test('should return translated robots.txt from URL=%s, Content=%s', (url: string, content: string) => {
      // Act
      const actual = translator.translate({ url: parse(url), content });

      // Assert
      expect(actual).toBeDefined();
    });
  });
});
