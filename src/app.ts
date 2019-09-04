import { Config, GraphQLResponse } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { Context, resolvers, typeDefs } from './graphql';
import { ChromiumBrowserService } from './service/browser';

const app = express();

const config: Config = {
  typeDefs,
  resolvers,
  context: async (): Promise<Context> => {
    return {
      browser: await ChromiumBrowserService.create(),
    };
  },
  formatResponse: (response: GraphQLResponse, options: { context: Context }): GraphQLResponse => {
    options.context.browser
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
