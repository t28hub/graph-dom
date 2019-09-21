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

import { format, Url } from 'url';
import { Cache } from './cache';
import { RobotsTxt } from './robotsTxt';
import { Optional } from '../util';
import { KeyValueCache } from 'apollo-server-caching';

export class RobotsTxtCache implements Cache<Url, RobotsTxt> {
  public constructor(private readonly cache: KeyValueCache<string>) {}

  public async get(key: Url): Promise<Optional<RobotsTxt>> {
    const urlString = format(key);
    const cached = await this.cache.get(urlString);
    if (cached === undefined) {
      return Optional.empty();
    }

    const parsed = RobotsTxt.parse(key, cached);
    return Optional.of(parsed);
  }

  public async set(key: Url, value: RobotsTxt, ttl?: number): Promise<void> {
    const urlString = format(key);
    await this.cache.set(urlString, value.content, { ttl });
  }

  public async delete(key: Url): Promise<void> {
    const urlString = format(key);
    await this.cache.delete(urlString);
  }
}
