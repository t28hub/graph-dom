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
import { puppeteer } from 'chrome-aws-lambda';
import { AxiosProvider } from './axiosProvider';
import { BrowserModule } from './browserModule';
import { CacheModule } from './cacheModule';
import { TextFetcher } from './textFetcher';

function parseInt(value: string | undefined): number | undefined {
  return value !== undefined ? Number.parseInt(value) : undefined;
}

export const InfrastructureModule = new GraphQLModule({
  imports: [
    BrowserModule.forRoot({
      path: process.env.GRAPH_DOM_BROWSER_PATH || puppeteer.executablePath(),
      headless: process.env.GRAPH_DOM_BROWSER_HEADLESS !== 'false',
    }),
    CacheModule.forRoot({
      host: process.env.GRAPH_DOM_REDIS_HOST,
      port: parseInt(process.env.GRAPH_DOM_REDIS_PORT),
      password: process.env.GRAPH_DOM_REDIS_PASSWORD,
    }),
  ],
  providers: [AxiosProvider, TextFetcher],
});
