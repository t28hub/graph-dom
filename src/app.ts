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

import axios, { AxiosInstance } from 'axios';
import { Config, GraphQLResponse } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { Context, resolvers, typeDefs } from './graphql';
import { ChromeBrowserService } from './service/chromeBrowserService';
import { RobotsFetcher } from './service/robotsFetcher';
import { Logger } from './util/logger/logger';
import { getLogger } from './util/logger';

const app = express();

const logger: Logger = getLogger();
const config: Config = {
  typeDefs,
  resolvers,
  context: async (): Promise<Context> => {
    const axiosClient: AxiosInstance = axios.create();
    return {
      browserService: await ChromeBrowserService.create(),
      robotsFetcher: new RobotsFetcher(axiosClient),
    };
  },
  formatResponse: (response: GraphQLResponse, options: { context: Context }): GraphQLResponse => {
    options.context.browserService
      .close()
      .then(() => logger.info('Browser service is closed'))
      .catch((e: Error) => logger.warn('Failed to close BrowserService: %s', e));
    return response;
  },
  playground: true,
  tracing: true,
};
const server = new ApolloServer(config);
server.applyMiddleware({ app });

export default app;