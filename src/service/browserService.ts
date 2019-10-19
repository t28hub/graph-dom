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

import { Url } from 'url';
import { Document } from '../domain';

// https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagegotourl-options
export type WaitUntil =
  | 'load' // Wait until 'load' event is fired.
  | 'domcontentloaded' // Wait until 'DOMContentLoaded' event is fired.
  | 'networkidle0' // Wait until network connections are no more than 0.
  | 'networkidle2'; // Wait until network connections are no more than 2.

export interface Options {
  readonly timeout: number;
  readonly userAgent: string;
  readonly waitUntil: WaitUntil;
  readonly javaScriptEnabled: boolean;
}

export interface BrowserService {
  open(url: Url, options?: Partial<Options>): Promise<Document>;

  dispose(): Promise<void>;
}
