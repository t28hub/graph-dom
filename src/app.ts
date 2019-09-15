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
import { Context, DataSources } from './graphql/context';
import { schema } from './graphql/schama';
import { ChromeBrowserService } from './service/chromeBrowserService';
import { RobotsTxtFetcher } from './service/robotsTxtFetcher';
import { Logger } from './util/logger/logger';
import { getLogger } from './util/logger';
import { BrowserDataSource } from './graphql/dataSources/browserDataSource';
import { puppeteer } from 'chrome-aws-lambda';

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

const config: Config = {
  schema,
  dataSources: (): DataSources => {
    const browserOptions = {
      browserPath:
        process.env.NODE_ENV !== 'production'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : puppeteer.executablePath(),
      headless: process.env.NODE_ENV !== 'production',
    };
    const browserService = new ChromeBrowserService(browserOptions);
    const axiosClient: AxiosInstance = axios.create();
    const robotsFetcher = new RobotsTxtFetcher(axiosClient);
    return {
      browser: new BrowserDataSource(browserService, robotsFetcher),
    };
  },
  context: (): Partial<Context> => {
    return {};
  },
  formatResponse: (response: GraphQLResponse, options: { context: Context }): GraphQLResponse => {
    const logger: Logger = getLogger();
    const { browser } = options.context.dataSources;
    browser
      .close()
      .then(() => {
        logger.info('Browser is closed');
      })
      .catch((e: Error) => {
        logger.info('Failed to close browser: %s', e);
      });
    return response;
  },
  playground: true,
  tracing: true,
};
const server = new ApolloServer(config);
server.applyMiddleware({ app });

export default app;
