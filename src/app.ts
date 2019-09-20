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

import { Config } from 'apollo-server-core';
import { DataSources } from 'apollo-server-core/src/graphqlOptions';
import { ApolloServer } from 'apollo-server-express';
import axios from 'axios';
import express from 'express';
import helmet from 'helmet';
import { getConfig, Mode } from './config';
import { Context } from './graphql/context';
import { BrowserDataSource } from './graphql/dataSources/browserDataSource';
import { BrowserLifecyclePlugin } from './graphql/plugins/browserLifecyclePlugin';
import { schema } from './graphql/schama';
import { ChromeBrowserService } from './service/chromeBrowserService';

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

const serverConfig: Config = {
  schema,
  context: (): Omit<Context, 'dataSources'> => {
    const { path, headless } = config.browser;
    return {
      axios: axios.create(),
      // Instantiate browser by each request to isolate state of browser.
      browser: new ChromeBrowserService({ path, headless }),
    };
  },
  dataSources: (): DataSources<Context> => {
    return {
      browser: new BrowserDataSource(),
    };
  },
  plugins: [new BrowserLifecyclePlugin()],
  playground: config.mode === Mode.DEVELOPMENT,
  tracing: config.mode === Mode.DEVELOPMENT,
  debug: config.mode === Mode.DEVELOPMENT,
};
const server = new ApolloServer(serverConfig);
server.applyMiddleware({ app });

export default app;
