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
import { Document } from '../dom';

export interface Options {
  readonly browserPath: string;
  readonly headless: boolean;
}

export type WaitUntil = 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';

export interface OpenOptions {
  readonly timeout: number;
  readonly userAgent: string;
  readonly waitUntil: WaitUntil;
}

export interface BrowserService {
  open(url: Url, options?: Partial<OpenOptions>): Promise<Document>;

  dispose(): Promise<void>;
}
