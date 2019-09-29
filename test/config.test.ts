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
import puppeteer from '../src/__mocks__/puppeteer';
import { Config, DEFAULT_LOGGING_PATTERN, DEFAULT_SERVER_PORT, getConfig, Mode } from '../src/config';
import { Level } from '../src/util/logging/level';

jest.mock('chrome-aws-lambda', () => {
  return { puppeteer };
});

describe('Config', () => {
  const env = process.env;
  describe('getConfig', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.resetModules();
      process.env = { ...env };
      delete process.env.NODE_ENV;
    });

    afterEach(() => {
      process.env = env;
    });

    test('should throw Error when .env file is missing', () => {
      // Arrange
      process.env = {
        NODE_ENV: 'production'
      };

      // Assert
      expect(() => {
        // Act
        getConfig(true);
      }).toThrowError(/^Failed to load '\.env\.production': .+/);
    });

    each([
      [
        {
          CI: 'true'
        },
        {}
      ],
      [
        {
          CI: 'true',
          NODE_ENV: 'development'
        },
        {
          mode: Mode.DEVELOPMENT
        }
      ],
      [
        {
          CI: 'true',
          NODE_ENV: 'production'
        },
        {
          mode: Mode.PRODUCTION
        }
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_SERVER_PORT: '8081'
        },
        {
          server: {
            port: 8081
          }
        }
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_CACHE_REDIS_HOST: 'localhost'
        },
        {
          cache: {
            redis: {
              host: 'localhost',
              port: 6379,
              password: undefined
            }
          }
        }
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_CACHE_REDIS_HOST: 'localhost',
          GRAPH_DOM_CACHE_REDIS_PORT: 6380
        },
        {
          cache: {
            redis: {
              host: 'localhost',
              port: 6380,
              password: undefined
            }
          }
        }
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_CACHE_REDIS_HOST: 'localhost',
          GRAPH_DOM_CACHE_REDIS_PASSWORD: 'REDIS_PASSWORD'
        },
        {
          cache: {
            redis: {
              host: 'localhost',
              port: 6379,
              password: 'REDIS_PASSWORD'
            }
          }
        }
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_LOGGING_LEVEL: 'debug'
        },
        {
          logging: {
            level: Level.DEBUG,
            pattern: DEFAULT_LOGGING_PATTERN
          }
        }
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_LOGGING_LEVEL: 'info'
        },
        {
          logging: {
            level: Level.INFO,
            pattern: DEFAULT_LOGGING_PATTERN
          }
        }
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_LOGGING_LEVEL: 'warn'
        },
        {
          logging: {
            level: Level.WARN,
            pattern: DEFAULT_LOGGING_PATTERN
          }
        }
      ],

      [
        {
          CI: 'true',
          GRAPH_DOM_LOGGING_LEVEL: 'error'
        },
        {
          logging: {
            level: Level.ERROR,
            pattern: DEFAULT_LOGGING_PATTERN
          }
        }
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_LOGGING_LEVEL: 'trace'
        },
        {
          logging: {
            level: Level.TRACE,
            pattern: DEFAULT_LOGGING_PATTERN
          }
        }
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_LOGGING_PATTERN: '[%r] [TEST] - %m%n'
        },
        {
          logging: {
            level: Level.INFO,
            pattern: '[%r] [TEST] - %m%n'
          }
        }
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_BROWSER_PATH: '/path/to/chrome'
        },
        {
          browser: {
            path: '/path/to/chrome',
            headless: true
          }
        }
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_BROWSER_HEADLESS: 'true'
        },
        {
          browser: {
            path: puppeteer.executablePath(),
            headless: true
          }
        }
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_BROWSER_HEADLESS: 'false'
        },
        {
          browser: {
            path: puppeteer.executablePath(),
            headless: false
          }
        }
      ]
    ]).test(`should return config from ${JSON.stringify('%s')}`, (environment: { [name: string]: string }, expected: Config) => {
      // Arrange
      process.env = { ...environment };
      puppeteer.executablePath.mockReturnValue('/path/to/chrome');
      const defaultConfig: Config = {
        mode: Mode.DEVELOPMENT,
        server: {
          port: DEFAULT_SERVER_PORT
        },
        cache: {},
        logging: {
          level: Level.INFO,
          pattern: DEFAULT_LOGGING_PATTERN
        },
        browser: {
          path: puppeteer.executablePath(),
          headless: true
        }
      };

      // Act
      const actual = getConfig();

      // Assert
      expect(actual).toEqual({ ...defaultConfig, ...expected });
    });

    each([
      [
        {
          CI: 'true',
          NODE_ENV: 'test'
        },
        'Unknown mode: test'
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_SERVER_PORT: 'invalid-port'
        },
        'Invalid number: invalid-port'
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_SERVER_PORT: 'false'
        },
        'Invalid number: false'
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_LOGGING_LEVEL: 'test'
        },
        'Unknown level: test'
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_BROWSER_HEADLESS: 'test'
        },
        'Invalid boolean: test'
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_BROWSER_HEADLESS: '1'
        },
        'Invalid boolean: 1'
      ]
    ]).test(`should throw TypeError from invalid value ${JSON.stringify('%s')}`, (environment: { [name: string]: string }, expected: string) => {
      // Arrange
      process.env = { ...environment };

      // Assert
      expect(() => {
        // Act
        getConfig();
      }).toThrowError(expected);
    });
  });
});
