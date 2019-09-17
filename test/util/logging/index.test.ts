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
import { getLogger } from '../../../src/util/logging';

jest.mock('log4js');
log4js.getLogger = jest.fn().mockImplementation((category?: string) => {
  return { level: '' };
});

describe('getLogger', () => {
  test('should instantiate logger with default category', () => {
    // Act
    const actual = getLogger();

    // Assert
    expect(actual).toBeDefined();
    expect(log4js.getLogger).toBeCalledWith('GraphDOM');
  });

  test('should instantiate logger with specified category', () => {
    // Act
    const actual = getLogger('Test');

    // Assert
    expect(actual).toBeDefined();
    expect(log4js.getLogger).toBeCalledWith('Test');
  });
});
