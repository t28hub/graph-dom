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
  readonly engineApiKey?: string;
  readonly engineSchemaTag?: string;
  readonly queryDepthLimit: number;
  readonly queryComplexityLimit: number;
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
  readonly apollo: ApolloConfig;
  readonly browser: BrowserConfig;
  readonly redis?: RedisConfig;
}

const DEFAULT_NODE_ENV = 'development';
export const parseMode = (nodeEnv: string | undefined): Mode => {
  const name = nodeEnv || DEFAULT_NODE_ENV;
  return {
    name,
    debug: name === DEFAULT_NODE_ENV,
    tracing: name === DEFAULT_NODE_ENV,
    playground: name === DEFAULT_NODE_ENV,
  };
};

const DEFAULT_SERVER_PORT = 8080;
export const parsePort = (serverPort: string | undefined): number => {
  return serverPort ? parseInt(serverPort) : DEFAULT_SERVER_PORT;
};

const DEFAULT_COMPLEXITY_LIMIT = 15;
const DEFAULT_DEPTH_LIMIT = 5;
export const parseApolloConfig = (env: typeof process.env = process.env): ApolloConfig => {
  const queryConfig: ApolloConfig = {
    queryComplexityLimit: env.QUERY_COMPLEXITY_LIMIT ? parseInt(env.QUERY_COMPLEXITY_LIMIT) : DEFAULT_COMPLEXITY_LIMIT,
    queryDepthLimit: env.QUERY_DEPTH_LIMIT ? parseInt(env.QUERY_DEPTH_LIMIT) : DEFAULT_DEPTH_LIMIT,
  };

  if (!env.APOLLO_API_KEY || !env.APOLLO_SCHEMA_TAG) {
    return queryConfig;
  }

  const engineConfig: Required<Pick<ApolloConfig, 'engineApiKey' | 'engineSchemaTag'>> = {
    engineApiKey: env.APOLLO_API_KEY,
    engineSchemaTag: env.APOLLO_SCHEMA_TAG,
  };
  return { ...engineConfig, ...queryConfig };
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

const DEFAULT_LOG_LEVEL = 'debug';
export const getConfig = (env: typeof process.env = process.env): Config => {
  return {
    mode: parseMode(env.NODE_ENV),
    port: parsePort(env.SERVER_PORT),
    logLevel: parseLevel(env.LOGGING_LEVEL || DEFAULT_LOG_LEVEL),
    apollo: parseApolloConfig(env),
    browser: parseBrowserConfig(env),
    redis: parseRedisConfig(env.REDIS_URL),
  };
};
