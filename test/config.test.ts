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

import { puppeteer } from 'chrome-aws-lambda';
import each from 'jest-each';
import { Config, getConfig, Mode } from '../src/config';
import { Level } from '../src/util/logging/level';

const DEFAULT_SERVER_PORT = 8080;
const DEFAULT_LOGGING_PATTERN = '[%r] [%p] %c - %m%n';
const DEFAULT_BROWSER_PATH = puppeteer.executablePath();

const defaultConfig: Config = {
  mode: Mode.DEVELOPMENT,
  server: {
    port: DEFAULT_SERVER_PORT
  },
  logging: {
    level: Level.INFO,
    pattern: DEFAULT_LOGGING_PATTERN
  },
  browser: {
    path: DEFAULT_BROWSER_PATH,
    headless: true
  }
};

describe('Config', () => {
  const env = process.env;
  describe('getConfig', () => {
    beforeEach(() => {
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
        { ...defaultConfig }
      ],
      [
        {
          CI: 'true',
          NODE_ENV: 'development'
        },
        {
          ...defaultConfig,
          mode: Mode.DEVELOPMENT
        }
      ],
      [
        {
          CI: 'true',
          NODE_ENV: 'production'
        },
        {
          ...defaultConfig,
          mode: Mode.PRODUCTION
        }
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_SERVER_PORT: '8081'
        },
        {
          ...defaultConfig,
          server: {
            port: 8081
          }
        }
      ],
      [
        {
          CI: 'true',
          GRAPH_DOM_LOGGING_LEVEL: 'debug'
        },
        {
          ...defaultConfig,
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
          ...defaultConfig,
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
          ...defaultConfig,
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
          ...defaultConfig,
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
          ...defaultConfig,
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
          ...defaultConfig,
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
          ...defaultConfig,
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
          ...defaultConfig,
          browser: {
            path: DEFAULT_BROWSER_PATH,
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
          ...defaultConfig,
          browser: {
            path: DEFAULT_BROWSER_PATH,
            headless: false
          }
        }
      ]
    ]).test(`should return config from ${JSON.stringify('%s')}`, (environment: { [name: string]: string }, expected: Config) => {
      // Arrange
      process.env = { ...environment };

      // Act
      const actual = getConfig();

      // Assert
      expect(actual).toEqual(expected);
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
