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

import { Level, Logger } from './logger';
import log4js, { Configuration } from 'log4js';
import { Log4jsLogger } from './log4jsLogger';

export interface Config {
  readonly level: Level;
}

const DEFAULT_LOGGER_NAME = 'GraphDOM';

export class LoggerFactory {
  public static configure(config: Config): void {
    const { level } = config;
    const configuration: Configuration = {
      appenders: {
        default: {
          type: 'stdout',
          layout: {
            type: 'colored',
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
  }

  public static getLogger(name: string = DEFAULT_LOGGER_NAME): Logger {
    return new Log4jsLogger(log4js.getLogger(name));
  }
}
