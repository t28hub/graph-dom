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
import { LoggerProvider } from './loggerProvider';
import { Level } from '../util/logging/logger';
import { Provider } from '@graphql-modules/di';

export const DEFAULT_LOGGING_PATTERN = '[%r] [%p] %c - %m';

export interface Config {
  readonly level: Level;
  readonly pattern: string;
}

export const LoggingModule = new GraphQLModule<Config>({
  providers: ({ config }: GraphQLModule): Provider[] => [
    {
      provide: 'LoggingLevel',
      useValue: config.level,
    },
    {
      provide: 'LoggingPattern',
      useValue: config.pattern,
    },
    LoggerProvider,
  ],
});
