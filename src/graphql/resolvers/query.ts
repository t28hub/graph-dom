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

import { IResolverObject } from 'graphql-tools';
import { parse } from 'url';
import { Context } from '../context';
import { Document } from '../../dom';

export const resolver: IResolverObject = {
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  page: async (parent: any, args: { url: string }, context: Context): Promise<Document> => {
    const { url } = args;
    const parsed = parse(url);
    const { browser } = context.dataSources;
    return await browser.fetch(parsed);
  },
};
