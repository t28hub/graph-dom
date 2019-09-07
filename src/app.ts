import axios, { AxiosInstance } from 'axios';
import { Config, GraphQLResponse } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { Context, resolvers, typeDefs } from './graphql';
import { ChromiumBrowserService } from './service/chromiumBrowserService';
import { RobotsFetcher } from './service/robotsFetcher';

const app = express();

const config: Config = {
  typeDefs,
  resolvers,
  context: async (): Promise<Context> => {
    const axiosClient: AxiosInstance = axios.create();
    return {
      browserService: await ChromiumBrowserService.create(),
      robotsFetcher: new RobotsFetcher(axiosClient),
    };
  },
  formatResponse: (response: GraphQLResponse, options: { context: Context }): GraphQLResponse => {
    options.context.browserService
      .close()
      .then(() => console.info('Browser service is closed'))
      .catch((cause: Error) => console.warn('Failed to close BrowserService', cause));
    return response;
  },
  playground: true,
  tracing: true,
};
const server = new ApolloServer(config);
server.applyMiddleware({ app });

export default app;
