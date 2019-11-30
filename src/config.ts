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

import { parse } from 'url';
import { Level, parseLevel } from './util/logging/logger';

export interface Mode {
  readonly name: string;
  readonly debug: boolean;
  readonly tracing: boolean;
  readonly playground: boolean;
}

export interface ApolloConfig {
  readonly apiKey: string;
  readonly schemaTag: string;
}

export interface BrowserConfig {
  readonly path?: string;
  readonly headless: boolean;
}

export interface RedisConfig {
  readonly host?: string;
  readonly port?: number;
  readonly path?: string;
  readonly password?: string;
}

export interface Config {
  readonly mode: Mode;
  readonly port: number;
  readonly logLevel: Level;
  readonly apollo?: ApolloConfig;
  readonly browser: BrowserConfig;
  readonly redis?: RedisConfig;
}

const NAME_DEVELOPMENT = 'development';
export const parseMode = (value: string): Mode => {
  const name = value || NAME_DEVELOPMENT;
  if (name === NAME_DEVELOPMENT) {
    return {
      name,
      debug: true,
      tracing: true,
      playground: true,
    };
  }

  return {
    name,
    debug: false,
    tracing: false,
    playground: false,
  };
};

export const parsePort = (value: string | undefined, defaultPort: number): number => {
  return value ? Number.parseInt(value) : defaultPort;
};

export const parseApolloConfig = (env: typeof process.env = process.env): ApolloConfig | undefined => {
  if (!env.APOLLO_API_KEY || !env.APOLLO_SCHEMA_TAG) {
    return undefined;
  }

  return {
    apiKey: env.APOLLO_API_KEY,
    schemaTag: env.APOLLO_SCHEMA_TAG,
  };
};

export const parseBrowserConfig = (env: typeof process.env = process.env): BrowserConfig => {
  return {
    path: env.BROWSER_PATH,
    headless: env.BROWSER_HEADLESS !== 'false',
  };
};

export const parseRedisConfig = (url: string | undefined): RedisConfig | undefined => {
  if (!url) {
    return undefined;
  }

  const parsed = parse(url);
  const host = parsed.hostname !== null ? parsed.hostname : undefined;
  const port = parsed.port !== null ? Number.parseInt(parsed.port) : undefined;
  const path = parsed.path !== null ? parsed.path : undefined;
  const password = parsed.auth !== null ? parsed.auth.split(':').pop() : undefined;
  return { host, port, path, password };
};

const DEFAULT_NODE_ENV = 'development';
const DEFAULT_SERVER_PORT = 8080;
const DEFAULT_LOG_LEVEL = 'debug';
export const getConfig = (env: typeof process.env = process.env): Config => {
  return {
    mode: parseMode(env.NODE_ENV || DEFAULT_NODE_ENV),
    port: parsePort(env.SERVER_PORT, DEFAULT_SERVER_PORT),
    logLevel: parseLevel(env.LOGGING_LEVEL || DEFAULT_LOG_LEVEL),
    apollo: parseApolloConfig(env),
    browser: parseBrowserConfig(env),
    redis: parseRedisConfig(env.REDIS_URL),
  };
};
