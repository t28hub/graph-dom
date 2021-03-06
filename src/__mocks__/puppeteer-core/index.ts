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

import { errors } from 'puppeteer';

export const browser = {
  newPage: jest.fn(),
  close: jest.fn(),
  isConnected: jest.fn(),
  disconnect: jest.fn(),
  pages: jest.fn(),
  userAgent: jest.fn(),
  wsEndpoint: jest.fn(),
  createIncognitoBrowserContext: jest.fn(),
};

export const page = {
  $: jest.fn(),
  close: jest.fn(),
  evaluate: jest.fn(),
  evaluateHandle: jest.fn(),
  goto: jest.fn(),
  on: jest.fn(),
  setDefaultTimeout: jest.fn(),
  setDefaultNavigationTimeout: jest.fn(),
  setJavaScriptEnabled: jest.fn(),
  setRequestInterception: jest.fn(),
  setUserAgent: jest.fn(),
  url: jest.fn(),
};

export const response = {
  status: jest.fn(),
  text: jest.fn(),
};

export const element = {
  $: jest.fn(),
  $$: jest.fn(),
};

export default {
  executablePath: jest.fn(),
  launch: jest.fn(),
  connect: jest.fn(),
  errors,
};
