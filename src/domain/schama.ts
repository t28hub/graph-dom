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

import { importSchema } from 'graphql-import';
import { resolve } from 'path';
import { resolver as queryResolver } from './query/resolver';
import { resolver as nodeResolver } from './node/resolver';
import { resolver as documentResolver } from './document/resolver';
import { resolver as elementResolver } from './element/resolver';

const path = resolve(__dirname, './query/typeDef.graphql');
export const typeDefs = importSchema(path);

export const resolvers = {
  Query: queryResolver,
  Node: nodeResolver,
  Document: documentResolver,
  Element: elementResolver,
};