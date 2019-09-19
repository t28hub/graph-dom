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
import helmet from 'helmet';
import { getConfig, Mode } from './config';
import { Context } from './graphql/context';
import { schema } from './graphql/schama';
import { ChromeBrowserService } from './service/chromeBrowserService';
import { RobotsTxtFetcher } from './service/robotsTxtFetcher';
import { getLogger } from './util/logging';
import { DataSources } from 'apollo-server-core/src/graphqlOptions';
import { BrowserDataSource } from './graphql/dataSources/browserDataSource';

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

const config = getConfig();
const logger = getLogger();

const serverConfig: Config = {
  schema,
  context: (): Omit<Context, 'dataSources'> => {
    return {};
  },
  dataSources: (): DataSources<Context> => {
    const { path, headless } = config.browser;
    const browserService = new ChromeBrowserService({ path, headless });
    const axiosClient: AxiosInstance = axios.create();
    const robotsTxtFetcher = new RobotsTxtFetcher(axiosClient);
    return {
      browser: new BrowserDataSource(browserService, robotsTxtFetcher),
    };
  },
  formatResponse: (response: GraphQLResponse, options: { context: Context }): GraphQLResponse => {
    const { browser } = options.context.dataSources;
    browser
      .dispose()
      .then(() => logger.info('Browser data source is closed'))
      .catch((e: Error) => logger.warn('Failed to close BrowserService: %s', e));
    return response;
  },
  playground: config.mode === Mode.DEVELOPMENT,
  tracing: config.mode === Mode.DEVELOPMENT,
  debug: config.mode === Mode.DEVELOPMENT,
};
const server = new ApolloServer(serverConfig);
server.applyMiddleware({ app });

export default app;
