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

import { GraphQLModule, ModuleContext } from '@graphql-modules/core';
import express from 'express';
import { resolvers, typeDefs } from './graphql/schama';
import { InfrastructureModule } from './infrastructure';
import { BrowserDataSource } from './graphql/dataSources/browserDataSource';
import { ChromeBrowserService } from './service/chromeBrowserService';
import { RobotsTxtFetcher } from './service/robotsTxtFetcher';

export const AppModule = new GraphQLModule({
  typeDefs,
  resolvers,
  context: (session: express.Request, context: ModuleContext): ModuleContext => {
    return context;
  },
  providers: [RobotsTxtFetcher, ChromeBrowserService, BrowserDataSource],
  imports: [InfrastructureModule],
});
