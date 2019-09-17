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

import log4js, { Configuration } from 'log4js';
import { Level } from './level';
import { Log4jsLogger } from './log4jsLogger';
import { getConfig } from '../../config';

const config = getConfig();
const { level, pattern } = config.logging;
const configuration: Configuration = {
  appenders: {
    default: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern,
      },
    },
  },
  categories: {
    default: {
      appenders: ['default'],
      level: Level[level].toLowerCase(),
      enableCallStack: true,
    },
  },
};
log4js.configure(configuration);

export interface Logger {
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  debug(message: string, ...args: any[]): void;

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  info(message: string, ...args: any[]): void;

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  warn(message: string, ...args: any[]): void;

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  error(message: string, ...args: any[]): void;

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  trace(message: string, ...args: any[]): void;
}

const DEFAULT_LOG_NAME = 'GraphDOM';

export function getLogger(name: string = DEFAULT_LOG_NAME): Logger {
  return new Log4jsLogger(log4js.getLogger(name));
}
