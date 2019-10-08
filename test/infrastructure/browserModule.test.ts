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
import puppeteer from '../../src/__mocks__/puppeteer';
import { BrowserModule } from '../../src/infrastructure/browserModule';
import { BrowserProvider } from '../../src/infrastructure/browserProvider';

jest.mock('chrome-aws-lambda', () => {
  return { puppeteer };
});

describe('BrowserModule', () => {
  const { injector } = BrowserModule.forRoot({
    path: '/path/to/browser',
    headless: true
  });

  test('should provide browser path by BrowserPath', () => {
    // Act
    const actual = injector.get('BrowserPath');

    // Assert
    expect(actual).toEqual('/path/to/browser');
  });

  test('should provide browser headless by BrowserHeadless', () => {
    // Act
    const actual = injector.get('BrowserHeadless');

    // Assert
    expect(actual).toBeTruthy();
  });

  test('should instantiate BrowserProvider', () => {
    // Act
    const actual = injector.get(BrowserProvider);

    // Assert
    expect(actual).toBeDefined();
  });
});
