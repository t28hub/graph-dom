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
import { Config, getConfig } from '../src/config';
import { Level } from '../src/util/logging/logger';

describe('Config', () => {
  describe('getConfig', () => {
    each([
      [
        {},
        {
          mode: {
            name: 'development',
            debug: true,
            tracing: true,
            playground: true
          },
          port: 8080,
          logLevel: Level.INFO,
          apollo: {
            queryComplexityLimit: 15,
            queryDepthLimit: 5
          },
          browser: {
            path: undefined,
            headless: true
          },
          redis: undefined
        }
      ],
      [
        {
          NODE_ENV: 'development'
        },
        {
          mode: {
            name: 'development',
            debug: true,
            tracing: true,
            playground: true
          }
        }
      ],
      [
        {
          NODE_ENV: 'production'
        },
        {
          mode: {
            name: 'production',
            debug: false,
            tracing: false,
            playground: false
          }
        }
      ],
      [
        {
          SERVER_PORT: '8081'
        },
        {
          port: 8081
        }
      ],
      [
        {
          QUERY_COMPLEXITY_LIMIT: '10'
        },
        {
          apollo: {
            queryComplexityLimit: 10,
            queryDepthLimit: 5
          }
        }
      ],
      [
        {
          QUERY_DEPTH_LIMIT: '2'
        },
        {
          apollo: {
            queryComplexityLimit: 15,
            queryDepthLimit: 2
          }
        }
      ],
      [
        {
          APOLLO_API_KEY: 'YOUR_APOLLO_ENGINE_KEY'
        },
        {
          apollo: {
            queryComplexityLimit: 15,
            queryDepthLimit: 5
          }
        }
      ],
      [
        {
          APOLLO_SCHEMA_TAG: 'YOUR_APOLLO_SCHEMA_TAG'
        },
        {
          apollo: {
            queryComplexityLimit: 15,
            queryDepthLimit: 5
          }
        }
      ],
      [
        {
          APOLLO_API_KEY: 'YOUR_APOLLO_ENGINE_KEY',
          APOLLO_SCHEMA_TAG: 'YOUR_APOLLO_SCHEMA_TAG'
        },
        {
          apollo: {
            engineApiKey: 'YOUR_APOLLO_ENGINE_KEY',
            engineSchemaTag: 'YOUR_APOLLO_SCHEMA_TAG',
            queryComplexityLimit: 15,
            queryDepthLimit: 5
          }
        }
      ],
      [
        {
          BROWSER_PATH: '/path/to/chrome'
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
          BROWSER_HEADLESS: 'true'
        },
        {
          browser: {
            path: undefined,
            headless: true
          }
        }
      ],
      [
        {
          BROWSER_HEADLESS: 'false'
        },
        {
          browser: {
            path: undefined,
            headless: false
          }
        }
      ],
      [
        {
          REDIS_URL: 'redis://user:Passw0rd!@localhost:6379/path'
        },
        {
          redis: {
            host: 'localhost',
            port: 6379,
            path: '/path',
            password: 'Passw0rd!'
          }
        }
      ],
      [
        {
          REDIS_URL: 'redis://'
        },
        {
          redis: {
            host: '',
            port: undefined,
            path: undefined,
            password: undefined
          }
        }
      ]
    ]).test('should parse %j as %j', (env: typeof process.env, expected: Partial<Config>) => {
      // Act
      const actual = getConfig(env);

      // Assert
      expect(actual).toMatchObject(expected);
    });

    test('should use process.env when no argument is given', () => {
      // Act
      const actual = getConfig();

      // Assert
      expect(actual).toBeTruthy();
      expect(actual).toHaveProperty('mode');
      expect(actual).toHaveProperty('port');
      expect(actual).toHaveProperty('logLevel');
      expect(actual).toHaveProperty('apollo');
      expect(actual).toHaveProperty('browser');
      expect(actual).toHaveProperty('redis');
    });
  });
});
