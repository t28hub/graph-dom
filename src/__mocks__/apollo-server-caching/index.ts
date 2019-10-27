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

import { KeyValueCache } from 'apollo-server-caching';

export const cache = {
  set: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  flush: jest.fn(),
  close: jest.fn(),
};

export const InMemoryLRUCache = jest.fn();
export const PrefixingKeyValueCache = jest.fn((cache: KeyValueCache, prefix: string) => {
  return {
    get: (key: string): Promise<string | undefined> => {
      return cache.get(`${prefix}${key}`);
    },
    set: (key: string, value: string, options?: { ttl?: number }): Promise<void> => {
      return cache.set(`${prefix}${key}`, value, options);
    },
  };
});
