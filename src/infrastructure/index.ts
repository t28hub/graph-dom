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
import { puppeteer } from 'chrome-aws-lambda';
import { AxiosProvider } from './axiosProvider';
import { BrowserModule } from './browserModule';
import { DEFAULT_LOGGING_PATTERN, LoggingModule } from './loggingModule';
import { DEFAULT_REDIS_HOST, DEFAULT_REDIS_PORT, CacheModule } from './cacheModule';
import { Level } from '../util/logging/logger';

function parseInt(value: string | undefined, defaultValue: number): number {
  if (!Number.isInteger(defaultValue)) {
    throw new TypeError(`Default value must be integer: ${defaultValue}`);
  }
  if (!value) {
    return defaultValue;
  }
  return Number.parseInt(value);
}

function parseLevel(value: string | undefined, defaultValue: Level): Level {
  if (!value) {
    return defaultValue;
  }
  switch (value) {
    case Level[Level.DEBUG]:
      return Level.DEBUG;
    case Level[Level.INFO]:
      return Level.INFO;
    case Level[Level.WARN]:
      return Level.WARN;
    case Level[Level.ERROR]:
      return Level.ERROR;
    case Level[Level.TRACE]:
      return Level.TRACE;
    default:
      return defaultValue;
  }
}

export const InfrastructureModule = new GraphQLModule({
  imports: [
    BrowserModule.forRoot({
      path: process.env.GRAPH_DOM_BROWSER_PATH || puppeteer.executablePath(),
      headless: process.env.GRAPH_DOM_BROWSER_HEADLESS === 'true',
    }),
    LoggingModule.forRoot({
      level: parseLevel(process.env.GRAPH_DOM_LOGGING_LEVEL, Level.INFO),
      pattern: process.env.GRAPH_DOM_LOGGING_PATTERN || DEFAULT_LOGGING_PATTERN,
    }),
    CacheModule.forRoot({
      host: process.env.GRAPH_DOM_REDIS_HOST || DEFAULT_REDIS_HOST,
      port: parseInt(process.env.GRAPH_DOM_REDIS_PORT, DEFAULT_REDIS_PORT),
      password: process.env.GRAPH_DOM_REDIS_PASSWORD,
    }),
  ],
  providers: [AxiosProvider],
});
