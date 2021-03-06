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
import { Provider } from '@graphql-modules/di';
import Chrome from 'chrome-aws-lambda';
import { BrowserProvider } from './browserProvider';

export interface Config {
  readonly path?: string;
  readonly headless?: boolean;
}

export const BrowserModule = new GraphQLModule<Config>({
  providers: ({ config }: GraphQLModule): Provider[] => [
    {
      provide: 'BrowserPath',
      useFactory: async (): Promise<string> => {
        return config.path || (await Chrome.executablePath);
      },
    },
    {
      provide: 'BrowserHeadless',
      useValue: config.headless || true,
    },
    BrowserProvider,
  ],
});
