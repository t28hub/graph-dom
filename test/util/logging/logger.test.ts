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
import { Level, parseLevel } from '../../../src/util/logging/logger';

describe('Logger', () => {
  describe('parseLevel', () => {
    each([
      ['debug', Level.DEBUG],
      ['info', Level.INFO],
      ['warn', Level.WARN],
      ['error', Level.ERROR],
      ['trace', Level.TRACE],
    ]).test('should return parsed level: input=%s', (input: string, expected: Level) => {
      // Act
      const actual = parseLevel(input);

      // Assert
      expect(actual).toBe(expected);
    });

    each([
      '',
      'test',
      'invalid'
    ]).test('should throw error when input does not correspond to level: input=%s', (input: string) => {
      // Assert
      expect(() => {
        // Act
        parseLevel(input);
      }).toThrowError(TypeError);
    });
  });
});
