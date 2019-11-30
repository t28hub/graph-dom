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

import { Level } from '../../../src/util/logging/logger';
import { LoggerFactory } from '../../../src/util/logging/loggerFactory';
import log4js from '../../../src/__mocks__/log4js';

describe('LoggerFactory', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('configure', () => {
    test('should configure log4js', () => {
      // Act
      LoggerFactory.configure({
        level: Level.DEBUG
      });

      // Assert
      expect(log4js.configure).toBeCalledTimes(1)
    });
  });

  describe('getLogger', () => {
    test('should instantiate logger with default category', () => {
      // Act
      const actual = LoggerFactory.getLogger();

      // Assert
      expect(actual).toBeDefined();
      expect(log4js.getLogger).toBeCalledTimes(1);
      expect(log4js.getLogger).toBeCalledWith('GraphDOM');
    });

    test('should instantiate logger with specified category', () => {
      // Act
      const actual = LoggerFactory.getLogger('Test');

      // Assert
      expect(actual).toBeDefined();
      expect(log4js.getLogger).toBeCalledTimes(1);
      expect(log4js.getLogger).toBeCalledWith('Test');
    });
  });
});
