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

import 'reflect-metadata';
import { CacheModule } from '../../src/infrastructure/cacheModule';
import { RedisCacheProvider } from '../../src/infrastructure/redisCacheProvider';

describe('CacheModule', () => {
  const { injector } = CacheModule.forRoot({
    host: '127.0.0.1',
    port: 6379,
    password: 'p@ssw0rd'
  });

  test('should provide host by RedisHost', () => {
    // Act
    const actual = injector.get('RedisHost');

    // Assert
    expect(actual).toEqual('127.0.0.1');
  });

  test('should provide port by RedisPort', () => {
    // Act
    const actual = injector.get('RedisPort');

    // Assert
    expect(actual).toEqual(6379);
  });

  test('should provide password by RedisPassword', () => {
    // Act
    const actual = injector.get('RedisPassword');

    // Assert
    expect(actual).toEqual('p@ssw0rd');
  });

  test('should provide RedisCacheProvider', () => {
    // Act
    const actual = injector.get(RedisCacheProvider);

    // Assert
    expect(actual).toBeInstanceOf(RedisCacheProvider);
  });
});
