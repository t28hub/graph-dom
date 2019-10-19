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
import { WaitUntil } from './options';
import { DocumentDataSource, Options } from '../document/documentDataSource';
import { validateUrl } from '../../util';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions */
export const resolver: IResolverObject = {
  page: async (
    parent: any,
    args: { url: string; waitUntil?: string; userAgent?: string; javaScriptEnabled?: boolean },
    { injector }: ModuleContext
  ): Promise<Document> => {
    const { url, waitUntil, userAgent, javaScriptEnabled } = args;
    validateUrl(url);

    const parsed = parse(url);
    const browser = injector.get(DocumentDataSource);
    const fetchOptions: Partial<Options> = {
      waitUntil: waitUntil ? (<any>WaitUntil)[waitUntil] : WaitUntil.NETWORK_IDLE2,
      userAgent: userAgent ? userAgent : 'GraphDOM/1.0.0',
      javaScriptEnabled: javaScriptEnabled,
    };
    return await browser.fetch(parsed, { ...fetchOptions });
  },
};
