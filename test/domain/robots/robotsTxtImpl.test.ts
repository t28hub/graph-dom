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
import parse from 'robots-parser';
import { parse as parseURL } from 'url';
import { RobotsTxtImpl } from '../../../src/domain/robots/robotsTxtImpl';

describe('RobotsTxtImpl', () => {
  describe('isAllowed', () => {
    const content = `
    User-agent: TestBot
    Allow: /
    Disallow: /admin
    `;
    const robots = parse('https://example.com', content);
    const robotsTxt = new RobotsTxtImpl(robots);

    each([
      [true, 'https://example.com', undefined],
      [true,'https://example.com', 'TestBot'],
      [true,'https://example.com/test', undefined],
      [true,'https://example.com/test', 'TestBot'],
      [true,'https://example.com/admin', undefined],
      [true, 'https://example.com/admin', 'UnknownBot'],
      [false, 'https://example.com/admin', 'TestBot'],
      [false, 'https://example.org', undefined],
    ]).test('should return %p when URL=%s and UserAgent=%p', (expected: boolean, url: string, userAgent?: string) => {
      // Act
      const parsed = parseURL(url);
      const actual = robotsTxt.isAllowed(parsed, userAgent);

      // Assert
      expect(actual).toEqual(expected);
    });
  });
});
