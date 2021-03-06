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
import { Provider } from '@graphql-modules/di';
import { CacheProvider } from './cacheProvider';

export interface Config {
  readonly host?: string;
  readonly port?: number;
  readonly path?: string;
  readonly password?: string;
}

export const CacheModule = new GraphQLModule<Config>({
  providers: ({ config }: GraphQLModule): Provider[] => [
    {
      provide: 'RedisHost',
      useValue: config.host,
    },
    {
      provide: 'RedisPort',
      useValue: config.port,
    },
    {
      provide: 'RedisPath',
      useValue: config.path,
    },
    {
      provide: 'RedisPassword',
      useValue: config.password,
    },
    CacheProvider,
  ],
});
