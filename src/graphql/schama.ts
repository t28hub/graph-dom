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

import { GraphQLSchema } from 'graphql';
import { IResolvers, ITypeDefinitions, makeExecutableSchema } from 'graphql-tools';
import { resolver as queryResolver } from './resolvers/query';
import { resolver as nodeResolver } from './resolvers/node';
import { resolver as documentResolver } from './resolvers/document';
import { resolver as elementResolver } from './resolvers/element';
import attribute from './typeDefs/attribute';
import data from './typeDefs/data';
import document from './typeDefs/document';
import element from './typeDefs/element';
import node from './typeDefs/node';
import query from './typeDefs/query';

const typeDefs: ITypeDefinitions = [attribute, data, document, element, node, query];

const resolvers: IResolvers = {
  Query: queryResolver,
  Node: nodeResolver,
  Document: documentResolver,
  Element: elementResolver,
};

export const schema: GraphQLSchema = makeExecutableSchema({ typeDefs, resolvers });
