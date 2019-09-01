import {DocumentNode} from 'graphql';
import {IResolvers} from 'graphql-tools';
import {resolver as queryResolver} from './resolvers/query';
import {resolver as nodeResolver} from './resolvers/node';
import {resolver as documentResolver} from './resolvers/document';
import {resolver as elementResolver} from './resolvers/element';
import schema from './types/schema.graphql';

export {Context} from './context';
export const typeDefs: DocumentNode = schema;

export const resolvers: IResolvers = {
  Query: queryResolver,
  Node: nodeResolver,
  Document: documentResolver,
  Element: elementResolver,
};
