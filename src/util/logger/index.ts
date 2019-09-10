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
import { Level, Logger as ILogger } from './logger';
import { Log4jsLogger } from './log4jsLogger';

const ROOT_LOG_NAME = 'GraphDOM';

type Cache = Map<string, ILogger>;

const mapCache: Cache = new Map<string, ILogger>();

export function getLogger(name: string = ROOT_LOG_NAME, cache: Cache = mapCache): ILogger {
  const cached = cache.get(name);
  if (cached !== undefined) {
    return cached;
  }

  const logger = new Log4jsLogger(log4js.getLogger(name));
  logger.setLevel(Level.DEBUG);
  cache.set(name, logger);
  return logger;
}