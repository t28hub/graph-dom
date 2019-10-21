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
import { Document } from '..';
import { Options } from './options';
import { DocumentDataSource } from '../document/documentDataSource';
import { LoadEventTranslator, OptionsTranslator, UrlTranslator } from './translator';
import { check } from '../../util';

type Arguments = {
  url: string;
  timeout?: number;
  waitFor?: string;
  options?: Options;
};

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions */
export const resolver: IResolverObject = {
  page: async (parent: any, args: Arguments, { injector }: ModuleContext): Promise<Document> => {
    const dataSource = injector.get(DocumentDataSource);
    const urlTranslator = injector.get(UrlTranslator);
    const loadEventTranslator = injector.get(LoadEventTranslator);
    const optionsTranslator = injector.get(OptionsTranslator);

    const { url, timeout, waitFor, options } = args;
    check(timeout === undefined || timeout >= 0, `Timeout must be positive: timeout=${timeout}`);
    const parsed = urlTranslator.translate(url);
    const loadEvent = loadEventTranslator.translate(waitFor || 'LOAD');
    const requestOptions = optionsTranslator.translate(options || {});
    return await dataSource.request(parsed, timeout, loadEvent, requestOptions);
  },
};
