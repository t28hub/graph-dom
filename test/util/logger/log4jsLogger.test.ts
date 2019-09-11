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

import log4js from 'log4js';
import { Level } from '../../../src/util/logger/logger';
import { Log4jsLogger } from '../../../src/util/logger/log4jsLogger';

describe('Log4jsLogger', () => {
  describe('debug', () => {
    const mockedLogger = jest.fn().bind(log4js.getLogger());
    mockedLogger.debug = jest.fn();
    const logger = new Log4jsLogger(mockedLogger);

    test('should set debug level', () => {
      // Act
      logger.setLevel(Level.DEBUG);

      // Assert
      expect(mockedLogger.level).toBe('DEBUG');
    });

    test('should call debug method with message', () => {
      // Act
      const message = 'This is a debug message';
      logger.debug(message);

      // Assert
      expect(mockedLogger.debug).toBeCalledWith(message);
    });

    test('should call debug method with message and args', () => {
      // Act
      const message = 'This is a %s message';
      logger.debug(message, 'debug');

      // Assert
      expect(mockedLogger.debug).toBeCalledWith(message, 'debug');
    });
  });

  describe('info', () => {
    const mockedLogger = jest.fn().bind(log4js.getLogger());
    mockedLogger.info = jest.fn();
    const logger = new Log4jsLogger(mockedLogger);

    test('should set info level', () => {
      // Act
      logger.setLevel(Level.INFO);

      // Assert
      expect(mockedLogger.level).toBe('INFO');
    });

    test('should call info method with message', () => {
      // Act
      const message = 'This is an info message';
      logger.info(message);

      // Assert
      expect(mockedLogger.info).toBeCalledWith(message);
    });

    test('should call info method with message and args', () => {
      // Act
      const message = 'This is an %s message';
      logger.info(message, 'info');

      // Assert
      expect(mockedLogger.info).toBeCalledWith(message, 'info');
    });
  });

  describe('warn', () => {
    const mockedLogger = jest.fn().bind(log4js.getLogger());
    mockedLogger.warn = jest.fn();
    const logger = new Log4jsLogger(mockedLogger);

    test('should set warn level', () => {
      // Act
      logger.setLevel(Level.WARN);

      // Assert
      expect(mockedLogger.level).toBe('WARN');
    });

    test('should call warn method with message', () => {
      // Act
      const message = 'This is a warn message';
      logger.warn(message);

      // Assert
      expect(mockedLogger.warn).toBeCalledWith(message);
    });

    test('should call warn method with message and args', () => {
      // Act
      const message = 'This is a %s message';
      logger.warn(message, 'warn');

      // Assert
      expect(mockedLogger.warn).toBeCalledWith(message, 'warn');
    });
  });

  describe('error', () => {
    const mockedLogger = jest.fn().bind(log4js.getLogger());
    mockedLogger.error = jest.fn();
    const logger = new Log4jsLogger(mockedLogger);

    test('should set error level', () => {
      // Act
      logger.setLevel(Level.ERROR);

      // Assert
      expect(mockedLogger.level).toBe('ERROR');
    });

    test('should call error method with message', () => {
      // Act
      const message = 'This is an error message';
      logger.error(message);

      // Assert
      expect(mockedLogger.error).toBeCalledWith(message);
    });

    test('should call error method with message and args', () => {
      // Act
      const message = 'This is an %s message';
      logger.error(message, 'error');

      // Assert
      expect(mockedLogger.error).toBeCalledWith(message, 'error');
    });
  });
  describe('trace', () => {
    const mockedLogger = jest.fn().bind(log4js.getLogger());
    mockedLogger.trace = jest.fn();
    const logger = new Log4jsLogger(mockedLogger);

    test('should set trace level', () => {
      // Act
      logger.setLevel(Level.TRACE);

      // Assert
      expect(mockedLogger.level).toBe('TRACE');
    });

    test('should call trace method with message', () => {
      // Act
      const message = 'This is a trace message';
      logger.trace(message);

      // Assert
      expect(mockedLogger.trace).toBeCalledWith(message);
    });

    test('should call trace method with message and args', () => {
      // Act
      const message = 'This is a %s message';
      logger.trace(message, 'trace');

      // Assert
      expect(mockedLogger.trace).toBeCalledWith(message, 'trace');
    });
  });
});
