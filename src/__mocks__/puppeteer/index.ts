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

import { Browser, Page } from 'puppeteer';

export const page: Pick<
  Page,
  'close' | 'evaluateHandle' | 'goto' | 'setDefaultTimeout' | 'setDefaultNavigationTimeout' | 'setUserAgent' | 'url'
> = {
  close: jest.fn(),
  evaluateHandle: jest.fn().mockReturnValue(Promise.resolve(null)),
  goto: jest.fn().mockReturnValue(Promise.resolve(null)),
  setDefaultTimeout: jest.fn(),
  setDefaultNavigationTimeout: jest.fn(),
  setUserAgent: jest.fn(),
  url: jest.fn(),
};

export const browser: Pick<Browser, 'newPage' | 'close' | 'disconnect' | 'pages'> = {
  newPage: jest.fn(),
  close: jest.fn(),
  disconnect: jest.fn(),
  pages: jest.fn().mockReturnValue([]),
};

export default {
  executablePath: jest.fn().mockReturnValue('/path/to/chrome'),
  launch: jest.fn(),
};
