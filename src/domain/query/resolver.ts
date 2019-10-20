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

import { ModuleContext } from '@graphql-modules/core';
import { IResolverObject } from 'graphql-tools';
import { parse } from 'url';
import { Document } from '..';
import { Options } from './options';
import { Options as RequestOptions, LoadEvent } from '../browserDataSource';
import { DocumentDataSource } from '../document/documentDataSource';
import { validateUrl } from '../../util';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions */
export const resolver: IResolverObject = {
  page: async (
    parent: any,
    args: { url: string; waitFor?: string; options?: Options },
    { injector }: ModuleContext
  ): Promise<Document> => {
    const { url } = args;
    validateUrl(url);

    const dataSource = injector.get(DocumentDataSource);

    const parsed = parse(url);
    const options = args.options || {};
    const waitFor: LoadEvent | undefined = args.waitFor ? (<any>LoadEvent)[args.waitFor] : undefined;
    const requestOptions: RequestOptions = {
      timeout: options.timeout,
      userAgent: options.userAgent ? options.userAgent : 'GraphDOM/1.0.0',
      javaScriptEnabled: options.javaScriptEnabled,
    };
    return await dataSource.request(parsed, waitFor, requestOptions);
  },
};
