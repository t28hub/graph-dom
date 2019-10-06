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

import { Inject, Injectable, ProviderScope } from '@graphql-modules/di';
import { KeyValueCache } from 'apollo-server-caching';
import { RedisCache } from 'apollo-server-cache-redis';

@Injectable({
  scope: ProviderScope.Application,
  overwrite: false,
})
export class RedisProvider {
  public constructor(
    @Inject('RedisHost') private readonly host: string,
    @Inject('RedisPort') private readonly port: number,
    @Inject('RedisPassword') private readonly password?: string
  ) {}

  public provideCache(): KeyValueCache {
    const { host, port, password } = this;
    return new RedisCache({ host, port, password });
  }
}
