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
import { LoadEventTranslator } from '../../../../src/domain/query/translator';
import { LoadEvent } from '../../../../src/domain/browserDataSource';

describe('LoadEventTranslator', () => {
  const translator = new LoadEventTranslator();
  describe('translate', () => {
    each([
      ['LOAD', LoadEvent.LOAD],
      ['NETWORK_IDLE0', LoadEvent.NETWORK_IDLE0],
      ['NETWORK_IDLE2', LoadEvent.NETWORK_IDLE2],
      ['DOM_CONTENT_LOADED', LoadEvent.DOM_CONTENT_LOADED],
    ]).test('should return load event: event=%s', (input: string, expected: LoadEvent) => {
      // Act
      const actual = translator.translate(input);

      // Assert
      expect(actual).toBe(expected);
    });

    each([
      ['', 'Unknown load event: input='],
      ['UNKNOWN', 'Unknown load event: input=UNKNOWN'],
    ]).test('should throw an UserInputError: input=%s', (input: string, expected: string) => {
      // Assert
      expect(() => {
        // Act
        translator.translate(input);
      }).toThrowError(new UserInputError(expected));
    });
  });
});

