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
import { config } from 'dotenv';
import { Level } from './util/logging/level';

export enum Mode {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
}

export interface Config {
  readonly mode: Mode;
  readonly server: {
    readonly port: number;
  };
  readonly cache: {
    readonly redis?: {
      readonly host: string;
      readonly port: number;
      readonly password?: string;
    };
  };
  readonly logging: {
    readonly level: Level;
    readonly pattern: string;
  };
  readonly browser: {
    readonly path: string;
    readonly headless: boolean;
  };
}

const loaded: Set<string> = new Set<string>();

function load(path: string, force: boolean): void {
  if (!force && loaded.has(path)) {
    return;
  }

  const { error } = config({
    path,
    encoding: 'utf8',
  });

  if (error) {
    throw new Error(`Failed to load '${path}': ${error.message}`);
  }
  loaded.add(path);
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) {
    return defaultValue;
  }

  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch (e) {
    throw new TypeError(`Invalid boolean: ${value}`);
  }

  if (typeof parsed !== 'boolean') {
    throw new TypeError(`Invalid boolean: ${value}`);
  }
  return parsed;
}

function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) {
    return defaultValue;
  }

  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch (e) {
    throw new TypeError(`Invalid number: ${value}`);
  }

  if (typeof parsed !== 'number') {
    throw new TypeError(`Invalid number: ${value}`);
  }
  return parsed;
}

function parseMode(value: string | undefined, defaultValue: Mode = Mode.DEVELOPMENT): Mode {
  switch (value) {
    case 'development':
      return Mode.DEVELOPMENT;
    case 'production':
      return Mode.PRODUCTION;
    case undefined:
      return defaultValue;
    default:
      throw new TypeError(`Unknown mode: ${value}`);
  }
}

function parseLevel(value: string | undefined, defaultValue: Level): Level {
  switch (value) {
    case 'debug':
      return Level.DEBUG;
    case 'info':
      return Level.INFO;
    case 'warn':
      return Level.WARN;
    case 'error':
      return Level.ERROR;
    case 'trace':
      return Level.TRACE;
    case undefined:
      return defaultValue;
    default:
      throw new TypeError(`Unknown level: ${value}`);
  }
}

const DEFAULT_SERVER_PORT = 8080;
const DEFAULT_LOGGING_PATTERN = '[%r] [%p] %c - %m%n';
const DEFAULT_CACHE_REDIS_PORT = 6379;

export function getCacheConfig(): Pick<Config, 'cache'> {
  if (process.env.GRAPH_DOM_CACHE_REDIS_HOST) {
    return {
      cache: {
        redis: {
          host: `${process.env.GRAPH_DOM_CACHE_REDIS_HOST}`,
          port: parseNumber(process.env.GRAPH_DOM_CACHE_REDIS_PORT, DEFAULT_CACHE_REDIS_PORT),
          password: process.env.GRAPH_DOM_CACHE_REDIS_PASSWORD,
        },
      },
    };
  }
  return {
    cache: {},
  };
}

export function getConfig(reload: boolean = false): Config {
  const mode: Mode = parseMode(process.env.NODE_ENV);
  /**
   * When application is running on the ZEIT Now, loading `.env` file is skipped.
   * Environment variable `NOW_REGION` is set, application is running on the ZEIT Now.
   * The ZEIT Now uses env properties declared in `now.json` for could development.
   * And it uses `.env` for local development.
   * https://zeit.co/docs/v2/environment-variables-and-secrets/
   */
  if (process.env.NOW_REGION === undefined && process.env.CI === undefined) {
    load(`.env.${mode.toString()}`, reload);
  }

  const { cache } = getCacheConfig();
  return {
    mode,
    server: {
      port: parseNumber(process.env.GRAPH_DOM_SERVER_PORT, DEFAULT_SERVER_PORT),
    },
    cache,
    logging: {
      level: parseLevel(process.env.GRAPH_DOM_LOGGING_LEVEL, Level.INFO),
      pattern: process.env.GRAPH_DOM_LOGGING_PATTERN || DEFAULT_LOGGING_PATTERN,
    },
    browser: {
      path: process.env.GRAPH_DOM_BROWSER_PATH || puppeteer.executablePath(),
      headless: parseBoolean(process.env.GRAPH_DOM_BROWSER_HEADLESS, true),
    },
  };
}
