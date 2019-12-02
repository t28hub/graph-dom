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

import 'reflect-metadata';
import { Config as ServerConfig } from 'apollo-server-core';
import { DataSources } from 'apollo-server-core/src/graphqlOptions';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import depthLimit from 'graphql-depth-limit';
import helmet from 'helmet';
import { AppModule } from './appModule';
import { getConfig } from './config';
import { Context } from './context';
import { DocumentDataSource } from './domain/document/documentDataSource';
import { CacheProvider } from './infrastructure/cacheProvider';
import { queryComplexity } from './plugins';

const app = express();
app.use(
  helmet({
    frameguard: {
      action: 'deny',
    },
    hidePoweredBy: true,
    hsts: true,
    noSniff: true,
    xssFilter: true,
  })
);

const { schema, injector, context } = AppModule;
const cache = injector.get(CacheProvider).provideCache();

const config = getConfig();
const { apollo, mode } = config;
const serverConfig: ServerConfig = {
  schema,
  cache,
  modules: [AppModule],
  context,
  dataSources: (): DataSources<Context> => {
    const browser = injector.get(DocumentDataSource);
    return { browser };
  },
  plugins: [queryComplexity(schema, apollo.queryComplexityLimit)],
  validationRules: [depthLimit(apollo.queryDepthLimit)],
  engine: apollo.engineApiKey ? { apiKey: apollo.engineApiKey, schemaTag: apollo.engineSchemaTag } : false,
  debug: mode.debug,
  playground: mode.playground,
  tracing: mode.tracing,
};

export const server = new ApolloServer(serverConfig);
server.applyMiddleware({ app });

export default app;
