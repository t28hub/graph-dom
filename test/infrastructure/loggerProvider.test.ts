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

import { GraphQLModule } from '@graphql-modules/core';
import 'reflect-metadata';
import log4js from '../../src/__mocks__/log4js';
import { LoggerProvider } from '../../src/infrastructure/loggerProvider';
import { Level } from '../../src/util/logging/logger';

describe('LoggerProvider', () => {
  const testModule = new GraphQLModule();
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('onInit', () => {
    test('should configure log4js', () => {
      // Act
      const loggerProvider = new LoggerProvider(Level.INFO, '[%r] [%p] %c - %m');
      loggerProvider.onInit(testModule);

      // Assert
      expect(log4js.configure).toBeCalledTimes(1);
    });
  });

  describe('provideLogger', () => {
    test('should instantiate logger with default category', () => {
      // Arrange
      const loggerProvider = new LoggerProvider(Level.INFO, '[%r] [%p] %c - %m');
      loggerProvider.onInit(testModule);

      // Act
      const actual = loggerProvider.provideLogger();

      // Assert
      expect(actual).toBeDefined();
      expect(log4js.getLogger).toBeCalledTimes(1);
      expect(log4js.getLogger).toBeCalledWith('GraphDOM');
    });

    test('should instantiate logger with specified category', () => {
      // Arrange
      const loggerProvider = new LoggerProvider(Level.INFO, '[%r] [%p] %c - %m');
      loggerProvider.onInit(testModule);

      // Act
      const actual = loggerProvider.provideLogger('Test');

      // Assert
      expect(actual).toBeDefined();
      expect(log4js.getLogger).toBeCalledTimes(1);
      expect(log4js.getLogger).toBeCalledWith('Test');
    });
  });
});
