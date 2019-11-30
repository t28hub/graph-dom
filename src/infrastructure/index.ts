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

import { GraphQLModule } from '@graphql-modules/core';
import { AxiosProvider } from './axiosProvider';
import { BrowserModule } from './browserModule';
import { CacheModule } from './cacheModule';
import { TextFetcher } from './textFetcher';
import { getConfig } from '../config';

const config = getConfig();
export const InfrastructureModule = new GraphQLModule({
  imports: [BrowserModule.forRoot({ ...config.browser }), CacheModule.forRoot({ ...config.redis })],
  providers: [AxiosProvider, TextFetcher],
});
