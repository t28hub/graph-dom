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
import { RobotsTxt } from '../../src/service/robotsTxt';

describe('RobotsTxt', () => {
  describe('parse', () => {
    test('should instantiate from URL and content', () => {
      // Act
      const url = parse('https://example.com/robots.txt');
      const content = `
        User-agent: *
        Disallow: /
      `;
      const actual = RobotsTxt.parse(url, content);

      // Assert
      expect(actual).toBeDefined();
    });
  });

  describe('isAllowed', () => {
    const robotsUrl = parse('https://example.com/robots.txt');

    each([
      [
        '',
      ],
      [
        `
        User-agent: TestBot
        Disallow: /
        Disallow: /test/
        `,
      ],
      [
        `
        User-agent: *
        Disallow: /
        Allow: /test/
        `,
      ],
    ]).test('should return true when URL is allowed', (content: string) => {
      // Act
      const robotsTxt = RobotsTxt.parse(robotsUrl, content);
      const parsedUrl = parse('https://example.com/test/');
      const actual = robotsTxt.isAllowed(parsedUrl, 'GraphDOM/1.0.0');

      // Arrange
      expect(actual).toBeTruthy();
    });
    each([
      [
        `
        User-agent: *
        Disallow: /
        `,
      ],
      [
        `
        User-agent: *
        Disallow: /test/
        `,
      ],
      [
        `
        User-agent: *
        Allow: /
        Disallow: /test/
        `,
      ],
      [
        `
        User-agent: *
        Allow: /
        
        User-agent: GraphDOM
        Disallow: /test/
        `,
      ],
    ]).test('should return false when URL is disallowed', (content: string) => {
      // Act
      const robotsTxt = RobotsTxt.parse(robotsUrl, content);
      const parsedUrl = parse('https://example.com/test/');
      const actual = robotsTxt.isAllowed(parsedUrl, 'GraphDOM/1.0.0');

      // Arrange
      expect(actual).toBeFalsy();
    });
  });
});
