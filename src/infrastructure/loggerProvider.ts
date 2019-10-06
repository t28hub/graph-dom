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

import { GraphQLModule, OnInit } from '@graphql-modules/core';
import { Inject, Injectable, ProviderScope } from '@graphql-modules/di';
import log4js, { Configuration } from 'log4js';
import { Log4jsLogger } from '../util/logging/log4jsLogger';
import { Level, Logger } from '../util/logging/logger';

const DEFAULT_LOGGER_NAME = 'GraphDOM';

@Injectable({
  scope: ProviderScope.Application,
  overwrite: false,
})
export class LoggerProvider implements OnInit {
  public constructor(
    @Inject('LoggingLevel') private readonly level: Level,
    @Inject('LoggingPattern') private readonly pattern: string
  ) {}

  public onInit(module: GraphQLModule): void {
    this.configureLog4js();
  }

  public provideLogger(name: string = DEFAULT_LOGGER_NAME): Logger {
    return new Log4jsLogger(log4js.getLogger(name));
  }

  private configureLog4js(): void {
    const configuration: Configuration = {
      appenders: {
        default: {
          type: 'console',
          layout: {
            type: 'pattern',
            pattern: this.pattern,
          },
        },
      },
      categories: {
        default: {
          appenders: ['default'],
          level: Level[this.level].toLowerCase(),
          enableCallStack: true,
        },
      },
    };
    log4js.configure(configuration);
  }
}
