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
import axios from 'axios';
import { AxiosProvider } from '../../src/infrastructure/axiosProvider';

jest.mock('axios');

describe('AxiosProvider', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    test('should create an axios instance with config', () => {
      // Act
      const actual = new AxiosProvider();

      // Assert
      expect(actual).toBeTruthy();
      expect(axios.create).toBeCalledTimes(1);
      expect(axios.create).toBeCalledWith({
        timeout: expect.any(Number),
        headers: {
          'User-Agent': expect.any(String)
        }
      });
    });
  });

  describe('provideInstance', () => {
    test('should return shared instance', () => {
      // Act
      const provider = new AxiosProvider();
      const actual1st = provider.provideInstance();
      const actual2nd = provider.provideInstance();

      // Assert
      expect(actual1st).toBe(actual2nd);
    });
  });
});
