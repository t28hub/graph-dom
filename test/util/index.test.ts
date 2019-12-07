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

import { check } from '../../src/util';
import { UserInputError } from 'apollo-server-errors';

describe('util', () => {
  describe('check', () => {
    test('should not throw an Error when condition is true', () => {
      // Assert
      expect(() => {
        // Act
        check(true, 'This is an error message');
      }).not.toThrow();
    });

    test('should throw an Error when condition is false', () => {
      // Assert
      expect(() => {
        // Act
        check(false, 'This is an error message');
      }).toThrow(new UserInputError('This is an error message'));
    });

    test('should throw a given Error when condition is false', () => {
      // Assert
      expect(() => {
        // Act
        check(false, 'This is an error message', TypeError);
      }).toThrow(new TypeError('This is an error message'));
    });
  });
});
