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

import { Cookie } from './cookie';
import { Header } from './header';
import { Location } from './location';
import { Viewport } from './viewport';
import { Credentials } from './credentials';

export * from './cookie';
export * from './header';
export * from './location';
export * from './viewport';

export interface Options {
  readonly headers?: Header[];
  readonly cookies?: Cookie[];
  readonly timeout?: number;
  readonly location?: Location;
  readonly viewport?: Viewport;
  readonly userAgent?: string;
  readonly credentials?: Credentials;
  readonly javaScriptEnabled?: boolean;
}
